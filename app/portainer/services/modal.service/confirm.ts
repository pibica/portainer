import sanitize from 'sanitize-html';
import bootbox from 'bootbox';

import {
  applyBoxCSS,
  ButtonsOptions,
  confirmButtons,
  buildTitle,
  ModalTypeIcon,
} from './utils';

type ConfirmCallback = (confirmed: boolean) => void;

interface ConfirmAsyncOptions {
  title: string;
  message: string;
  buttons: ButtonsOptions;
}

interface ConfirmOptions extends ConfirmAsyncOptions {
  callback: ConfirmCallback;
}

export function confirmWebEditorDiscard() {
  const options = {
    title: buildTitle('Are you sure?'),
    message:
      'You currently have unsaved changes in the editor. Are you sure you want to leave?',
    buttons: {
      confirm: {
        label: 'Yes',
        className: 'btn-danger',
      },
    },
  };
  return new Promise((resolve) => {
    confirm({
      ...options,
      callback: (confirmed) => resolve(confirmed),
    });
  });
}

export function confirmAsync(options: ConfirmAsyncOptions) {
  return new Promise((resolve) => {
    confirm({
      ...options,
      title: buildTitle(options.title),
      callback: (confirmed) => resolve(confirmed),
    });
  });
}

export function confirmRedirect() {
  return new Promise((resolve) => {
    let count = 10;
    let intervalID: NodeJS.Timer;

    function messageFormatter() {
      return `There was an issue connecting to edge agent via tunnel. Click 'Retry' below to retry now, or wait ${count} seconds to automatically retry.`;
    }

    const options = {
      title: buildTitle('Failed opening tunnel', ModalTypeIcon.Destructive),
      message: messageFormatter(),
      buttons: {
        confirm: {
          label: 'Retry',
          className: 'btn-primary',
        },
      },
    };

    function dialogCallback(confirmed: boolean) {
      if (intervalID) {
        clearInterval(intervalID);
      }
      resolve(confirmed);
    }

    const dialog = confirm({
      ...options,
      callback: dialogCallback,
    });

    function countdownCallback() {
      count -= 1;
      dialog.find('.bootbox-body').html(messageFormatter());

      if (!count) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dialog.modal('hide');
        clearInterval(intervalID);
        resolve(true);
      }
    }

    function countdown() {
      intervalID = setInterval(countdownCallback, 1000);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dialog.init(countdown);
  });
}

export function confirmDestructiveAsync(options: ConfirmAsyncOptions) {
  return new Promise((resolve) => {
    confirm({
      ...options,
      title: buildTitle(options.title, ModalTypeIcon.Destructive),
      callback: (confirmed) => resolve(confirmed),
    });
  });
}

export function confirm(options: ConfirmOptions) {
  const box = bootbox.confirm({
    title: options.title,
    message: options.message,
    buttons: confirmButtons(options.buttons),
    callback: options.callback,
  });

  applyBoxCSS(box);

  return box;
}

export function confirmWarn(options: ConfirmOptions) {
  confirm({ ...options, title: buildTitle(options.title, ModalTypeIcon.Warn) });
}

export function confirmDestructive(options: ConfirmOptions) {
  confirm({
    ...options,
    title: buildTitle(options.title, ModalTypeIcon.Destructive),
  });
}

export function confirmImageForceRemoval(callback: ConfirmCallback) {
  confirm({
    title: buildTitle('Are you sure?', ModalTypeIcon.Destructive),
    message:
      'Forcing the removal of the image will remove the image even if it has multiple tags or if it is used by stopped containers.',
    buttons: {
      confirm: {
        label: 'Remove the image',
        className: 'btn-danger',
      },
    },
    callback,
  });
}

export function cancelRegistryRepositoryAction(callback: ConfirmCallback) {
  confirm({
    title: buildTitle('Are you sure?', ModalTypeIcon.Destructive),
    message:
      'WARNING: interrupting this operation before it has finished will result in the loss of all tags. Are you sure you want to do this?',
    buttons: {
      confirm: {
        label: 'Stop',
        className: 'btn-danger',
      },
    },
    callback,
  });
}

export function confirmDeletion(message: string, callback: ConfirmCallback) {
  const messageSanitized = sanitize(message);
  confirm({
    title: buildTitle('Are you sure?', ModalTypeIcon.Destructive),
    message: messageSanitized,
    buttons: {
      confirm: {
        label: 'Remove',
        className: 'btn-danger',
      },
    },
    callback,
  });
}

export function confirmWithTitle(
  title: string,
  message: string,
  callback: ConfirmCallback
) {
  const messageSanitized = sanitize(message);
  confirm({
    title: buildTitle(title, ModalTypeIcon.Destructive),
    message: messageSanitized,
    buttons: {
      confirm: {
        label: 'Remove',
        className: 'btn-danger',
      },
    },
    callback,
  });
}

export function confirmDetachment(message: string, callback: ConfirmCallback) {
  const messageSanitized = sanitize(message);
  confirm({
    title: buildTitle('Are you sure?'),
    message: messageSanitized,
    buttons: {
      confirm: {
        label: 'Detach',
        className: 'btn-primary',
      },
    },
    callback,
  });
}

export function confirmDisassociate(callback: ConfirmCallback) {
  const message =
    '<p>Disassociating this Edge environment will mark it as non associated and will clear the registered Edge ID.</p>' +
    '<p>Any agent started with the Edge key associated to this environment will be able to re-associate with this environment.</p>' +
    '<p>You can re-use the Edge ID and Edge key that you used to deploy the existing Edge agent to associate a new Edge device to this environment.</p>';
  confirm({
    title: buildTitle('About disassociating'),
    message: sanitize(message),
    buttons: {
      confirm: {
        label: 'Disassociate',
        className: 'btn-primary',
      },
    },
    callback,
  });
}

export function confirmUpdate(message: string, callback: ConfirmCallback) {
  const messageSanitized = sanitize(message);

  confirm({
    title: buildTitle('Are you sure?'),
    message: messageSanitized,
    buttons: {
      confirm: {
        label: 'Update',
        className: 'btn-primary',
      },
    },
    callback,
  });
}

export function confirmRedeploy(message: string, callback: ConfirmCallback) {
  const messageSanitized = sanitize(message);

  confirm({
    title: '',
    message: messageSanitized,
    buttons: {
      confirm: {
        label: 'Redeploy the applications',
        className: 'btn-primary',
      },
      cancel: {
        label: "I'll do it later",
      },
    },
    callback,
  });
}

export function confirmDeletionAsync(message: string) {
  return new Promise((resolve) => {
    confirmDeletion(message, (confirmed) => resolve(confirmed));
  });
}

export function confirmImageExport(callback: ConfirmCallback) {
  confirm({
    title: buildTitle('Caution'),
    message:
      'The export may take several minutes, do not navigate away whilst the export is in progress.',
    buttons: {
      confirm: {
        label: 'Continue',
        className: 'btn-primary',
      },
    },
    callback,
  });
}

export function confirmChangePassword() {
  return confirmAsync({
    title: buildTitle('Are you sure?'),
    message:
      'You will be logged out after the password change. Do you want to change your password?',
    buttons: {
      confirm: {
        label: 'Change',
        className: 'btn-primary',
      },
    },
  });
}

export function confirmForceChangePassword() {
  const box = bootbox.dialog({
    message:
      'Please update your password to a stronger password to continue using Portainer',
    buttons: {
      confirm: {
        label: 'OK',
        className: 'btn-primary',
      },
    },
  });

  applyBoxCSS(box);
}
