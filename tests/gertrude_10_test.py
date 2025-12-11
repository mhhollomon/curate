from Curate.lib.gertrude import gertrude

import pytest

def test_simple() :
    db = gertrude()
    db.add_table("test", key="id")
    db.table("test").set({"name": "test"}, "id")

    assert db.table("test").get("id") == {"name": "test"}

def test_self_id() :
    value = {"name": "test", "id": "id"}
    db = gertrude()
    db.add_table("test", key="id")
    db.table("test").set(value)

    assert db.table("test").get("id") == { **value }

def test_remove_value() :
    db = gertrude()
    db.add_table("test", key="id")
    db.table("test").set({"name": "test"}, "id")
    db.table("test").set({"name": "test2"}, "id2")
    db.table("test").remove_value("id")

    with pytest.raises(Exception):
        db.table("test").get("id")

    assert db.table("test").get("id2") == {"name": "test2"}

def test_index():
    db = gertrude()
    db.add_table("test", key="id")
    db.table("test").add_index("idx1", key="name")
    db.table("test").set({"name": "test", "id": "id"})

    assert db.table("test").get("test", "idx1") == {"name": "test", "id": "id"}
