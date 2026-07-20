import { useQuasar } from "quasar";

interface DeleteConfirmationOptions {
  title: string;
  message: string;
}

export function useDeleteConfirmation() {
  const $q = useQuasar();

  const confirmDelete = ({ title, message }: DeleteConfirmationOptions) =>
    new Promise<boolean>(resolve => {
      let resolved = false;
      const finish = (confirmed: boolean) => {
        if (resolved) return;
        resolved = true;
        resolve(confirmed);
      };

      $q.dialog({
        title,
        message,
        cancel: { label: "Cancelar", flat: true },
        persistent: true
      })
        .onOk(() => finish(true))
        .onCancel(() => finish(false))
        .onDismiss(() => finish(false));
    });

  return { confirmDelete };
}
