import { ref, watch, onMounted } from 'vue';
import { useFormStore } from '../stores/form-store';

interface UseFormPersistenceOptions {
  enabled?: boolean;
  hydrateOnMounted?: boolean;
  mergeStrategy?: 'saved-over-base' | 'base-over-saved';
}

export function useFormPersistence<T extends Record<string, unknown>>(
  formName: string,
  initialData: T,
  options: UseFormPersistenceOptions = {},
) {
  const formStore = useFormStore();
  const formData = ref<T>({ ...initialData });
  const persistenceEnabled = options.enabled !== false;
  let skipNextSave = false;

  const mergeFormData = (baseData: T, savedData?: Record<string, unknown>) => {
    if (!savedData) {
      return baseData;
    }

    if (options.mergeStrategy === 'base-over-saved') {
      return {
        ...savedData,
        ...baseData,
      } as T;
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
      ...nextInitialData,
    } as T;

    const savedData = persistenceEnabled
      ? formStore.getForm(formName)
      : undefined;
    formData.value = mergeFormData(baseData, savedData);
  };

  if (persistenceEnabled && options.hydrateOnMounted !== false) {
    onMounted(() => {
      hydrateForm();
    });
  }

  watch(
    formData,
    (newData) => {
      if (!persistenceEnabled) return;
      if (skipNextSave) {
        skipNextSave = false;
        return;
      }
      formStore.saveForm(formName, newData);
    },
    { deep: true },
  );

  const clearForm = () => {
    skipNextSave = true;
    formData.value = { ...initialData };
    if (persistenceEnabled) formStore.clearForm(formName);
  };

  const resetForm = (newInitialData?: T) => {
    const initial = newInitialData || initialData;
    skipNextSave = true;
    formData.value = { ...initial };
    if (persistenceEnabled) formStore.clearForm(formName);
  };

  return {
    formData,
    clearForm,
    hydrateForm,
    resetForm,
  };
}
