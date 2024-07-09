import { Context } from "../store/context";
import React, { useContext } from "react";

const Modal = () => {
  const { modal } = useContext(Context);
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="appear bg-[#e2e2e2] shadow-xl rounded-lg p-6 w-full max-w-md flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold font-SFProItalic text-2xl text-neutral-700">
            {modal.title}
          </h2>
          <p className="font-primary font-medium text-neutral-500">
            {modal.message}
          </p>
        </div>
        <div className="flex justify-end space-x-4">
          {modal.type !== "loading" && (
            <button
              onClick={modal.onCancel}
              className="font-primary px-4 py-2 bg-gray-400 text-gray-800 rounded hover:bg-gray-500 transition-all"
            >
              {modal.cancelText}
            </button>
          )}
          <button
            disabled={modal.type === "loading"}
            onClick={modal.onConfirm}
            className={`disabled:cursor-not-allowed flex flex-row gap-2 items-center font-primary px-4 py-2 transition-all ${
              modal.type === "delete"
                ? "bg-red-600 text-white  hover:bg-red-700"
                : modal.type === "loading"
                ? "disabled:bg-neutral-500 text-white "
                : "bg-green-500 text-white hover:bg-emerald-700"
            } rounded`}
          >
            {modal.type === "loading" ? (
              <>
                <div className="flex flex-row gap-3 items-center">
                  <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                  <p className="font-primary font-medium text-neutral-700">
                    {modal.confirmText}
                  </p>
                </div>
              </>
            ) : (
              modal.confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
