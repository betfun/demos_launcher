import { State, Action, Selector, StateContext } from '@ngxs/store';
import { Config, SupportedBrowsers } from './model';
import { GetConfig, SaveConfig } from './actions';
import { DbConfigService } from '../../core/services/db/config.service';
import { Injectable } from '@angular/core';
import { patch } from '@ngxs/store/operators';

@State<Config>({
  name: 'config',
  defaults: {
    browser: SupportedBrowsers.chrome,
    defaultPassword: 'salesforce123',
    useMiddleware: true
  }
})
@Injectable({
  providedIn: 'root',
})
export class ConfigState {
  constructor(private dbConfig: DbConfigService) { }

  @Selector()
  public static getState(state: Config): Config {
    return state;
  }

  @Action(SaveConfig)
  public add(ctx: StateContext<Config>, { payload }: SaveConfig): void {
    this.dbConfig.save(payload);

    ctx.dispatch(new GetConfig());
  }

  @Action(GetConfig)
  getNovels(ctx: StateContext<Config>): any {
    const config = this.dbConfig.get();
    if (config === undefined) {
      this.dbConfig.save(ctx.getState());
    } else {
      ctx.setState(patch(config));
    }
  }
}
