'use client';

import React, { useState } from "react";
import Field from "./Field";
import SubmitButton from "./SubmitButton";
import ErrorMessage from "./ErrorMessage";
import type { FormContextProps, FormProps } from "@/types/form";

const FormContext = React.createContext<FormContextProps>({} as FormContextProps);

function Form<T = Record<string, any>>({ children, schema, onSubmit } : FormProps<T>) {
  const [data, setData] = useState<T>({} as T);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const { error } = schema.validate(data, { abortEarly: false });
    if (!error) return null;

    const validationErrors: Record<string, string> = {};
    error.details.forEach((item: any) => {
      validationErrors[item.path[0]] = item.message;
    });

    return validationErrors;
  };

  interface HandleChange {
    (name: string, value: any): void;
  }

  const handleChange: HandleChange = (name, value) => {
    setErrors({
      ...errors,
      [name]: "",
    });
    (data as Record<string, any>)[name] = value;
    setData({ ...data });
  };

  interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  interface ValidationErrors {
    [key: string]: string;
  }

  const handleSubmit = async (e: HandleSubmitEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    const validationErrors: ValidationErrors | null = validate();
    setErrors(validationErrors || {});

    if (!validationErrors) {
      await Promise.all([
        onSubmit(data),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
    }
    setLoading(false);
  };

  return (
    <FormContext.Provider value={{ data: data as Record<string, any>, errors, handleChange, loading }}>
      <form onSubmit={handleSubmit}>{children}</form>
    </FormContext.Provider>
  );
};

export { FormContext, Form, Field, SubmitButton, ErrorMessage };
