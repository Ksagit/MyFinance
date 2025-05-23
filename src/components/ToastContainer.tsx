import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  buttonText?: string;
  onActionButtonClick?: () => void;
}

interface ToastContextType {
  addToast: (
    message: string,
    type?: Toast["type"],
    duration?: number,
    buttonText?: string,
    onActionButtonClick?: () => void
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: Toast["type"] = "info",
      duration: number = 3000,
      buttonText?: string,
      onActionButtonClick?: () => void
    ) => {
      const id = crypto.randomUUID();
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, message, type, duration, buttonText, onActionButtonClick },
      ]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onRemove]);

  const backgroundColor = {
    info: "bg-blue-500",
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
  }[toast.type || "info"];

  const handleActionButtonClick = () => {
    if (toast.onActionButtonClick) {
      toast.onActionButtonClick();
    }
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`p-3 rounded-lg text-white shadow-lg transition-all duration-300 transform ${backgroundColor}
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }
                  flex items-center`}
      role="alert"
    >
      <span className="flex-1">{toast.message}</span>
      {toast.buttonText && toast.onActionButtonClick ? (
        <button
          onClick={handleActionButtonClick}
          className="ml-4 px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 focus:outline-none text-sm font-semibold"
        >
          {toast.buttonText}
        </button>
      ) : null}
      {!toast.buttonText || !toast.onActionButtonClick ? (
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          &times;
        </button>
      ) : null}
    </div>
  );
};
