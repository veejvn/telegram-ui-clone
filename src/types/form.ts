export interface FormContextProps {
  data: Record<string, any>;  
  errors: Record<string, string>;
  handleChange: (name: string, value: any) => void;
  loading: boolean;
}

export interface FormProps<T = Record<string, any> > {
  children: React.ReactNode;
  schema: any; // Replace with your validation schema type
  onSubmit: (data: T) => Promise<void>;
}

export interface ErrorMessageProps {
  message: string;
}

export interface SubmitButtonProps {
  children: React.ReactNode;
  loadingText?: string;
}

export interface FieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | boolean;
}
