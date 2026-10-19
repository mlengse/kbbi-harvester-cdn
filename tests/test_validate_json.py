import json
import os
import sys
from pathlib import Path
from unittest.mock import mock_open, patch

import pytest

# Add .github/scripts directory to sys.path so validate_json can be imported
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / ".github" / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

import validate_json


def test_validate_chunk_valid_files(tmp_path):
    file1 = tmp_path / "valid1.json"
    file2 = tmp_path / "valid2.json"
    file1.write_text('{"name": "test1"}', encoding="utf-8")
    file2.write_text('[1, 2, 3]', encoding="utf-8")

    paths = [str(file1), str(file2)]
    count, errors = validate_json.validate_chunk(paths)

    assert count == 2
    assert errors == []


def test_validate_chunk_invalid_file(tmp_path):
    file1 = tmp_path / "invalid.json"
    file1.write_text('{"name": invalid}', encoding="utf-8")

    paths = [str(file1)]
    count, errors = validate_json.validate_chunk(paths)

    assert count == 0
    assert len(errors) == 1
    assert errors[0][0] == str(file1)
    assert "Expecting value" in errors[0][1] or "JSONDecodeError" in errors[0][1] or "invalid" in errors[0][1]


def test_validate_chunk_missing_file(tmp_path):
    file1 = tmp_path / "nonexistent.json"

    paths = [str(file1)]
    count, errors = validate_json.validate_chunk(paths)

    assert count == 0
    assert len(errors) == 1
    assert errors[0][0] == str(file1)


def test_validate_chunk_mixed_files(tmp_path):
    valid_file = tmp_path / "valid.json"
    invalid_file = tmp_path / "invalid.json"
    valid_file.write_text('{"key": "value"}', encoding="utf-8")
    invalid_file.write_text('{bad json}', encoding="utf-8")

    paths = [str(valid_file), str(invalid_file)]
    count, errors = validate_json.validate_chunk(paths)

    assert count == 1
    assert len(errors) == 1
    assert errors[0][0] == str(invalid_file)


def test_validate_chunk_open_exception(tmp_path):
    file_path = tmp_path / "test.json"
    file_path.write_text("{}", encoding="utf-8")

    paths = [str(file_path)]

    def mock_open_raise(*args, **kwargs):
        raise OSError("Permission denied")

    with patch("builtins.open", side_effect=mock_open_raise):
        count, errors = validate_json.validate_chunk(paths)

    assert count == 0
    assert len(errors) == 1
    assert errors[0][0] == str(file_path)
    assert "Permission denied" in errors[0][1]


def test_validate_chunk_read_exception(tmp_path):
    file_path = tmp_path / "test.json"
    file_path.write_text("{}", encoding="utf-8")

    paths = [str(file_path)]

    m = mock_open()
    m.return_value.read.side_effect = OSError("Read error")

    with patch("builtins.open", m):
        count, errors = validate_json.validate_chunk(paths)

    assert count == 0
    assert len(errors) == 1
    assert errors[0][0] == str(file_path)
    assert "Read error" in errors[0][1]


def test_main_success_single_process(tmp_path, monkeypatch, capsys):
    dir_path = tmp_path / "word-details"
    dir_path.mkdir()
    file1 = dir_path / "data.json"
    file1.write_text('{"status": "ok"}', encoding="utf-8")

    # Non-json file should be ignored
    file2 = dir_path / "readme.txt"
    file2.write_text("ignore me", encoding="utf-8")

    monkeypatch.setattr(validate_json, "DIRS", [str(dir_path)])

    validate_json.main()

    captured = capsys.readouterr()
    assert "Validated 1 JSON files." in captured.out
    assert "All files valid." in captured.out


def test_main_nonexistent_directories(monkeypatch, capsys):
    monkeypatch.setattr(validate_json, "DIRS", ["/path/that/does/not/exist/12345"])

    validate_json.main()

    captured = capsys.readouterr()
    assert "Validated 0 JSON files." in captured.out
    assert "All files valid." in captured.out


def test_main_failure_exits_with_code_1(tmp_path, monkeypatch, capsys):
    dir_path = tmp_path / "word-details"
    dir_path.mkdir()
    valid_file = dir_path / "valid.json"
    invalid_file = dir_path / "invalid.json"
    valid_file.write_text('{"a": 1}', encoding="utf-8")
    invalid_file.write_text('{"b": }', encoding="utf-8")

    monkeypatch.setattr(validate_json, "DIRS", [str(dir_path)])

    with pytest.raises(SystemExit) as exc_info:
        validate_json.main()

    assert exc_info.value.code == 1

    captured = capsys.readouterr()
    assert "Validated 2 JSON files." in captured.out
    assert "1 file(s) failed:" in captured.out
    assert str(invalid_file) in captured.out


def test_main_multiprocess_path(tmp_path, monkeypatch, capsys):
    dir_path = tmp_path / "word-details"
    dir_path.mkdir()

    # Create 105 valid json files to trigger multi-process logic (> 100 files)
    for i in range(105):
        f = dir_path / f"file_{i}.json"
        f.write_text(f'{{"id": {i}}}', encoding="utf-8")

    monkeypatch.setattr(validate_json, "DIRS", [str(dir_path)])
    monkeypatch.setattr(os, "cpu_count", lambda: 4)

    validate_json.main()

    captured = capsys.readouterr()
    assert "Validated 105 JSON files." in captured.out
    assert "All files valid." in captured.out


def test_main_multiprocess_path_with_errors(tmp_path, monkeypatch, capsys):
    dir_path = tmp_path / "word-details"
    dir_path.mkdir()

    # Create 104 valid files and 1 invalid file (> 100 files)
    for i in range(104):
        f = dir_path / f"file_{i}.json"
        f.write_text(f'{{"id": {i}}}', encoding="utf-8")

    bad_file = dir_path / "bad.json"
    bad_file.write_text('{"corrupt": ', encoding="utf-8")

    monkeypatch.setattr(validate_json, "DIRS", [str(dir_path)])
    monkeypatch.setattr(os, "cpu_count", lambda: 4)

    with pytest.raises(SystemExit) as exc_info:
        validate_json.main()

    assert exc_info.value.code == 1

    captured = capsys.readouterr()
    assert "Validated 105 JSON files." in captured.out
    assert "1 file(s) failed:" in captured.out
    assert str(bad_file) in captured.out
