import {useState, useCallback} from 'react';

type ValidationFunction<T> = (value: T) => string | null;

interface FormField<T> {
  value: T;
  error: string | null;
  touched: boolean;
  validate: ValidationFunction<T>;
}

type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

interface UseFormReturn<T> {
  formState: FormState<T>;
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
  handleBlur: <K extends keyof T>(field: K) => () => void;
  validateField: <K extends keyof T>(field: K) => boolean;
  validateAllFields: () => boolean;
  resetForm: () => void;
  getValues: () => T;
  setValues: (newValues: Partial<T>) => void;
}

const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validations: {[K in keyof T]?: ValidationFunction<T[K]>},
): UseFormReturn<T> => {
  const createInitialState = useCallback(
    (
      values: T,
      validators: {[K in keyof T]?: ValidationFunction<T[K]>},
    ): FormState<T> => {
      const formState = {} as FormState<T>;

      (Object.keys(values) as Array<keyof T>).forEach(key => {
        formState[key] = {
          value: values[key],
          error: null,
          touched: false,
          validate: validators[key] || (() => null),
        };
      });

      return formState;
    },
    [],
  );

  const [formState, setFormState] = useState<FormState<T>>(() =>
    createInitialState(initialValues, validations),
  );

  const handleChange = useCallback(
    <K extends keyof T>(field: K) =>
      (value: T[K]) => {
        setFormState(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            value,
            error: prev[field].touched ? prev[field].validate(value) : null,
          },
        }));
      },
    [],
  );

  const handleBlur = useCallback(
    <K extends keyof T>(field: K) =>
      () => {
        setFormState(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            touched: true,
            error: prev[field].validate(prev[field].value),
          },
        }));
      },
    [],
  );

  const validateField = useCallback(
    <K extends keyof T>(field: K): boolean => {
      const error = formState[field].validate(formState[field].value);

      setFormState(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          touched: true,
          error,
        },
      }));

      return error === null;
    },
    [formState],
  );

  const validateAllFields = useCallback((): boolean => {
    let isValid = true;
    const newFormState = {...formState};

    for (const key in formState) {
      const field = key as keyof T;
      const error = formState[field].validate(formState[field].value);

      newFormState[field] = {
        ...newFormState[field],
        touched: true,
        error,
      };

      if (error !== null) {
        isValid = false;
      }
    }

    setFormState(newFormState);
    return isValid;
  }, [formState]);

  const resetForm = useCallback(() => {
    setFormState(createInitialState(initialValues, validations));
  }, [createInitialState, initialValues, validations]);

  const getValues = useCallback((): T => {
    const values = {} as T;

    (Object.keys(formState) as Array<keyof T>).forEach(key => {
      values[key] = formState[key].value;
    });

    return values;
  }, [formState]);

  const setValues = useCallback(
    (newValues: Partial<T>) => {
      setFormState(prevFormState => {
        const updatedState = {...prevFormState};
        for (const key in newValues) {
          if (Object.prototype.hasOwnProperty.call(newValues, key) && key in updatedState) {
            const fieldKey = key as keyof T;
            updatedState[fieldKey] = {
              ...updatedState[fieldKey],
              value: newValues[fieldKey] as T[keyof T],
            };
          }
        }
        return updatedState;
      });
    },
    [],
  );

  return {
    formState,
    handleChange,
    handleBlur,
    validateField,
    validateAllFields,
    resetForm,
    getValues,
    setValues,
  };
};

export default useForm;
