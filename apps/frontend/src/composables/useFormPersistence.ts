import { ref, watch, onMounted } from 'vue';
import { useFormStore } from '../stores/form-store';

interface UseFormPersistenceOptions {
  hydrateOnMounted?: boolean;
}

export function useFormPersistence<T extends Record<string, unknown>>(
  formName: string,
  initialData: T,
  options: UseFormPersistenceOptions = {},
) {
  const formStore = useFormStore();
  const formData = ref<T>({ ...initialData });

  const mergeFormData = (baseData: T, savedData?: Record<string, unknown>) => {
    if (!savedData) {
      return baseData;
    }

    const mergedData = { ...baseData } as Record<string, unknown>;

    Object.entries(savedData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        mergedData[key] = value;
      }
    });

    return mergedData as T;
  };

  const hydrateForm = (nextInitialData?: Partial<T>) => {
    const baseData = {
      ...initialData,
      ...(nextInitialData ?? {}),
    } as T;

    const savedData = formStore.getForm(formName);
    formData.value = mergeFormData(baseData, savedData);
  };

  if (options.hydrateOnMounted !== false) {
    onMounted(() => {
      hydrateForm();
    });
  }

  watch(
    formData,
    (newData) => {
      formStore.saveForm(formName, newData);
    },
    { deep: true },
  );

  const clearForm = () => {
    formData.value = { ...initialData };
    formStore.clearForm(formName);
  };

  const resetForm = (newInitialData?: T) => {
    const initial = newInitialData || initialData;
    formData.value = { ...initial };
    formStore.clearForm(formName);
  };

  return {
    formData,
    clearForm,
    hydrateForm,
    resetForm,
  };
}