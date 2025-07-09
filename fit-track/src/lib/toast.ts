import toast from "react-hot-toast";

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showErrorToast = (message: string) => {
  toast.error(message);
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const updateToast = (
  toastId: string,
  message: string,
  type: "success" | "error"
) => {
  toast.dismiss(toastId);
  if (type === "success") {
    toast.success(message);
  } else {
    toast.error(message);
  }
};
