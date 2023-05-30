import { State, Action, StateContext } from '@ngxs/store';
import { OrgKillChrome, OrgLaunchChrome, OrgsInstallChrome } from './actions';
import { TasksStateModel } from './model';
import { ElectronService } from '../../core/services';
import { Injectable } from '@angular/core';
import { OrgDelete } from '../orgs/actions';

@State<TasksStateModel>({
  name: 'tasks',
  defaults: {
    loadingMessage: ''
  }
})
@Injectable({ providedIn: 'root' })
export class TasksState {

  constructor(private service: ElectronService) { }

  @Action(OrgLaunchChrome)
  public launch(ctx: StateContext<TasksStateModel>, { org, profile }: OrgLaunchChrome): void {

    ctx.patchState({ loadingMessage: 'Launching Org: ' + org.name + '...' });

    this.service.launch(org, {
      profile,
      useHomepage: true
    }).finally(() => {
      ctx.patchState({ loadingMessage: '' });
    });
  }

  @Action(OrgsInstallChrome)
  public install(ctx: StateContext<TasksStateModel>, { org, hardReset }: OrgsInstallChrome): void {
    // ctx.patchState({ loadingMessage: 'Installing Org: ' + org.name + '...' });

    // this.service.install(org, hardReset).finally(() =>
    //   ctx.patchState({ loadingMessage: '' }));
  }

  @Action(OrgKillChrome)
  public kill(ctx: StateContext<TasksStateModel>, { org }: OrgKillChrome): void {

    try {
      ctx.patchState({ loadingMessage: 'Killing Org: ' + org.name + '...' });

      this.service.kill(org.id);

    } finally {
      ctx.patchState({ loadingMessage: '' });
    }
  }

  @Action(OrgDelete)
  public delete(ctx: StateContext<TasksStateModel>, { org }: OrgDelete): void {
    this.service.delete(org);
  }
}
