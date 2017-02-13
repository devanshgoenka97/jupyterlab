// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Kernel
} from '@jupyterlab/services';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
  JupyterLab, JupyterLabPlugin
} from '../application';

import {
  CodeEditor
} from '../codeeditor';

import {
  ConsolePanel, IConsoleTracker
} from '../console';

import {
  INotebookTracker, NotebookPanel
} from '../notebook';

import {
  IRenderMime
} from '../rendermime';

import {
  CommandIDs, ITooltipManager, TooltipModel, TooltipWidget
} from './';


/**
 * The main tooltip service.
 */
const service: JupyterLabPlugin<ITooltipManager> = {
  id: 'jupyter.extensions.tooltip',
  autoStart: true,
  provides: ITooltipManager,
  activate: (app: JupyterLab): ITooltipManager => {
    let tooltip: TooltipWidget | null = null;
    return {
      invoke(options: ITooltipManager.IOptions): void {
        const { anchor, editor, kernel, rendermime  } = options;
        const model = new TooltipModel({ editor, kernel, rendermime });

        if (tooltip) {
          tooltip.model.dispose();
          tooltip.dispose();
          tooltip = null;
        }
        tooltip = new TooltipWidget({ anchor, model });
        Widget.attach(tooltip, document.body);
      }
    };
  }
};


/**
 * The console tooltip plugin.
 */
const consolePlugin: JupyterLabPlugin<void> = {
  id: 'jupyter.extensions.tooltip',
  autoStart: true,
  requires: [ITooltipManager, IConsoleTracker],
  activate: (app: JupyterLab, manager: ITooltipManager, consoles: IConsoleTracker): void => {
    // Add tooltip launch command.
    app.commands.addCommand(CommandIDs.launchConsole, {
      execute: () => {
        const parent = consoles.currentWidget;

        if (!parent) {
          return;
        }

        const anchor = parent.console;
        const editor = parent.console.prompt.editor;
        const kernel = parent.console.session.kernel;
        const rendermime = parent.console.rendermime;

        // If all components necessary for rendering exist, create a tooltip.
        if (!!editor && !!kernel && !!rendermime) {
          manager.invoke({ anchor, editor, kernel, rendermime });
        }
      }
    });

  }
};


/**
 * The notebook tooltip plugin.
 */
const notebookPlugin: JupyterLabPlugin<void> = {
  id: 'jupyter.extensions.tooltip',
  autoStart: true,
  requires: [ITooltipManager, INotebookTracker],
  activate: (app: JupyterLab, manager: ITooltipManager, notebooks: INotebookTracker): void => {
    // Add tooltip launch command.
    app.commands.addCommand(CommandIDs.launchNotebook, {
      execute: () => {
        const parent = notebooks.currentWidget;

        if (!parent) {
          return;
        }

        const anchor = parent.notebook;
        const editor = parent.notebook.activeCell.editor;
        const kernel = parent.kernel;
        const rendermime = parent.rendermime;

        // If all components necessary for rendering exist, create a tooltip.
        if (!!editor && !!kernel && !!rendermime) {
          manager.invoke({ anchor, editor, kernel, rendermime });
        }
      }
    });

  }
};


/**
 * Export the plugins as default.
 */
const plugins: JupyterLabPlugin<any>[] = [
  service, consolePlugin, notebookPlugin
];
export default plugins;
