import json
import sys
from pathlib import Path

import pytest

# Add .github/scripts directory to sys.path so smoke_test can be imported
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / ".github" / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

import smoke_test


def test_main_success(tmp_path, monkeypatch, capsys):
    file1 = tmp_path / "file1.json"
    file2 = tmp_path / "file2.json"
    content = json.dumps({"word": "test", "entries": ["entry1"]})
    file1.write_text(content, encoding="utf-8")
    file2.write_text(content, encoding="utf-8")

    monkeypatch.setattr(smoke_test, "SMOKE_FILES", [str(file1), str(file2)])

    smoke_test.main()

    captured = capsys.readouterr()
    assert "Smoke test passed: 2 files OK." in captured.out


def test_main_missing_file(tmp_path, monkeypatch, capsys):
    non_existent = tmp_path / "missing.json"

    monkeypatch.setattr(smoke_test, "SMOKE_FILES", [str(non_existent)])

    with pytest.raises(SystemExit) as exc_info:
        smoke_test.main()

    assert exc_info.value.code == 1

    captured = capsys.readouterr()
    assert "Smoke test failed:" in captured.out
    assert f"{non_existent}: file not found" in captured.out


def test_main_missing_required_fields(tmp_path, monkeypatch, capsys):
    file1 = tmp_path / "incomplete.json"
    file1.write_text(json.dumps({"word": "test"}), encoding="utf-8")

    monkeypatch.setattr(smoke_test, "SMOKE_FILES", [str(file1)])

    with pytest.raises(SystemExit) as exc_info:
        smoke_test.main()

    assert exc_info.value.code == 1

    captured = capsys.readouterr()
    assert "Smoke test failed:" in captured.out
    assert f"{file1}: missing fields" in captured.out


def test_main_empty_or_nonlist_entries(tmp_path, monkeypatch, capsys):
    file1 = tmp_path / "empty_entries.json"
    file1.write_text(json.dumps({"word": "test", "entries": []}), encoding="utf-8")

    monkeypatch.setattr(smoke_test, "SMOKE_FILES", [str(file1)])

    with pytest.raises(SystemExit) as exc_info:
        smoke_test.main()

    assert exc_info.value.code == 1

    captured = capsys.readouterr()
    assert "Smoke test failed:" in captured.out
    assert f"{file1}: 'entries' is empty or not a list" in captured.out


def test_main_file_read_exception(tmp_path, monkeypatch, capsys):
    file1 = tmp_path / "corrupt.json"
    file1.write_text("invalid json content", encoding="utf-8")

    monkeypatch.setattr(smoke_test, "SMOKE_FILES", [str(file1)])

    with pytest.raises(SystemExit) as exc_info:
        smoke_test.main()

    assert exc_info.value.code == 1

    captured = capsys.readouterr()
    assert "Smoke test failed:" in captured.out
    assert f"{file1}:" in captured.out
