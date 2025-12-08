from typing import Any, Callable, Dict, cast

class gertrude :
    def __init__(self) :
        self.tables : Dict[str, gertrude.gtable] = {}

    def add_table(self, name : str, key : Callable[[Any], str] |str | None = None) :
        self.tables[name] = gertrude.gtable(name, self, key)

    def table(self, name : str) :
        if name not in self.tables :
            raise Exception(f"Table {name} does not exist.")
        return self.tables[name]
    
    def __getatrr__(self, name : str) :
        return self.table(name)

    class gtable :
        def __init__(self, name : str, parent : 'gertrude', key : Callable[[Any], str] | str | None = None) :
            self.parent = parent
            self.name = name
            self.main = gertrude.gtable.storage(key)
            self.index : Dict[str, gertrude.gtable.storage] = {}

        class storage :
            def __init__(self, key : Callable[[Any], str] | str | None = None) :
                self.dict : Dict[str, Any] = {}
                if key is None :
                    key_func : Callable[[Any], str]  = lambda x : cast(str, x.__g_getkey())
                elif isinstance(key, str) :
                    key_func : Callable[[Any], str] = lambda x : cast(str, getattr(x, key))
                else :
                    key_func = key
                self.key_func = key_func

            def get(self, key : str) -> Any:
                return self.dict[key]
            def set(self, value : Any, key : str | None = None) -> None:
                if key is None :
                    key = self.key_func(value)
                self.dict[key] = value

        def get(self, key : str, index : str | None = None) -> Any :
            if index is not None :
                return self.index[index].get(key)
            return self.main.get(key)
        
        def set(self, value : Any, key : str | None = None) -> None :
            self.main.set(value, key)

        def add_index(self, name : str, key : Callable[[Any], str] | str | None = None) :
            self.index[name] = gertrude.gtable.storage(key)
            for v in self.main.dict.values() :
                self.index[name].set(v)
