import { defineStore } from 'pinia';

type FormState = Record<string, unknown>;

const STORAGE_KEY = 'form-persistence-store';

const isClient = typeof window !== 'undefined';

const loadPersistedState = (): Record<string, FormState> => {
  if (!isClient) {
    return {};
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
      return {};
    }

    const parsed = JSON.parse(rawState) as Record<string, FormState>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('No se pudo cargar el estado persistido de formularios:', error);
    return {};
  }
};

const persistState = (state: Record<string, FormState>) => {
  if (!isClient) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('No se pudo guardar el estado persistido de formularios:', error);
  }
};

export const useFormStore = defineStore('form-store', {
  state: () => ({
    forms: loadPersistedState(),
  }),

  actions: {
    saveForm(formName: string, formData: FormState) {
      this.forms[formName] = { ...formData };
      persistState(this.forms);
    },

    getForm(formName: string) {
      return this.forms[formName];
    },

    clearForm(formName: string) {
      delete this.forms[formName];
      persistState(this.forms);
    },

    clearAllForms() {
      this.forms = {};
      persistState(this.forms);
    },
  },
});