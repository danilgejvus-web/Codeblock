import { useState } from "react";

interface VariableStorage {
    [name: string]: any;
}

const [variables, setVariables] = useState<VariableStorage>({});

const getVariable = (name: string) => variables[name];
const setVariable = (name: string, value: any) => {
    setVariables(prev => ({ ...prev, [name]: value }));
};
