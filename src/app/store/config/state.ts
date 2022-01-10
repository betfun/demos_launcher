import { State, Action, Selector, StateContext } from "@ngxs/store";
import { Config } from "./model";
import { GetConfig, SaveConfig } from "./actions";
import { DbConfigService } from "../../core/services/db/config.service";
import { Injectable } from "@angular/core";

@State<Config>({
  name: "config"
})
@Injectable({
  providedIn: "root",
})
export class ConfigState {
  constructor(private dbConfig: DbConfigService) {}

  @Selector()
  public static getState(state: Config): Config {
    return state;
  }

  @Action(SaveConfig)
  public add(ctx: StateContext<Config>, { payload }: SaveConfig): void {
    // const stateModel = ctx.getState();
    this.dbConfig.save(payload);

    ctx.dispatch(new GetConfig());
    // this.dbConfig.save(payload).then((_) => {
    //   // stateModel.items = [...stateModel.items, payload];
    //   ctx.setState(payload);
    // });
  }

  @Action(GetConfig)
  getNovels(ctx: StateContext<Config>): any {
    const config = this.dbConfig.get();

    ctx.setState(config);
  }
}
