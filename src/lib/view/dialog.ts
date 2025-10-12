function initializeDialogElements() {
  const dialogElem = document.getElementById("dialog-container");
  const dialogTitleElem = document.getElementById("dialog-title");
  const dialogInputContainerElem = document.getElementById("dialog-input-container");
  const dialogInputElem = document.getElementById("dialog-input") as HTMLInputElement;
  const dialogOkButton = document.getElementById("dialog-ok-button");
  const dialogCancelButton = document.getElementById("dialog-cancel-button");

  if (!dialogElem) throw new Error("Dialog element not found");
  if (!dialogTitleElem) throw new Error("Dialog title element not found");
  if (!dialogInputContainerElem) throw new Error("Dialog input container element not found");
  if (!dialogOkButton) throw new Error("Dialog OK button not found");
  if (!dialogCancelButton) throw new Error("Dialog Cancel button not found");
  if (!dialogInputElem) throw new Error("Dialog input element not found");

  return { dialogElem, dialogTitleElem, dialogInputContainerElem, dialogInputElem, dialogOkButton, dialogCancelButton };
}

export async function confirm(title: string, cancellable: boolean) {
  const { dialogElem, dialogTitleElem, dialogInputContainerElem, dialogOkButton, dialogCancelButton } = initializeDialogElements();

  dialogElem.classList.add("visible");
  dialogTitleElem.innerHTML = title.replace(/\n/g, "<br>");
  dialogInputContainerElem.style.display = "none";
  dialogOkButton.style.display = "block";
  dialogCancelButton.style.display = cancellable ? "block" : "none";

  return new Promise<boolean>((resolve) => {
    const onOk = () => {
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      dialogElem.classList.remove("visible");
      dialogOkButton.removeEventListener("click", onOk);
      if (cancellable) {
        dialogCancelButton.removeEventListener("click", onCancel);
      }
    }

    dialogOkButton.addEventListener("click", onOk);
    if (cancellable) {
      dialogCancelButton.addEventListener("click", onCancel);
    }
  });
}

export async function prompt(message: string, cancellable: boolean, defaultValue: string = ""): Promise<string | null> {
  const {
    dialogElem,
    dialogTitleElem,
    dialogInputContainerElem,
    dialogInputElem,
    dialogOkButton,
    dialogCancelButton
  } = initializeDialogElements();

  dialogElem.classList.add("visible");
  dialogTitleElem.textContent = message;
  dialogInputContainerElem.style.display = "block";
  dialogOkButton.style.display = "block";
  dialogCancelButton.style.display = cancellable ? "block" : "none";
  dialogInputElem.value = defaultValue;
  dialogInputElem.focus();

  return new Promise<string | null>((resolve) => {
    const onOk = () => {
      if (dialogInputElem.value.trim() === "") {
        return;
      }
      cleanup();
      resolve(dialogInputElem.value);
    };

    const onCancel = () => {
      cleanup();
      resolve(null);
    };

    const cleanup = () => {
      dialogElem.classList.remove("visible");
      dialogOkButton.removeEventListener("click", onOk);
      if (cancellable) {
        dialogCancelButton.removeEventListener("click", onCancel);
      }
    }

    dialogOkButton.addEventListener("click", onOk);
    dialogInputElem.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onOk();
    });
    if (cancellable) {
      dialogCancelButton.addEventListener("click", onCancel);
    }
  });
}
