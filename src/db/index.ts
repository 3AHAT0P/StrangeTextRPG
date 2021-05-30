import neo4j, { Driver } from 'neo4j-driver';

// import { getConfig } from 'ConfigProvider';
import { getConfig } from '../ConfigProvider'; // @TODO: Debug only
import { ScenarioCursor } from './ScenarioCursor';

const config = getConfig();

export const buildDriver = (): Driver => (
  neo4j.driver(config.NEO4J_URL, neo4j.auth.basic(config.NEO4J_LOGIN, config.NEO4J_PASSWORD))
);

export { ScenarioCursor };

// --------------------------
// @TODO:
// Код ниже только для тестов и отладки
// запускается так  ts-node ./src/db/index.ts

// await transaction.run(
//   createRel,
//   {
//     scenarioId: 1,
//     locationId: 0,
//     from: 11,
//     to: 6,
//     text: 'Вернутся к выбору локаций',
//     type: 'CUSTOM',
//   },
// );

export const connect = async () => {
  const driver = buildDriver();
  const scenario = new ScenarioCursor(driver);
  try {
    await scenario.init({ scenarioId: 0 });
    const interaction = scenario.getInteraction();
    const actions = await scenario.getActions();
    console.log('@#!@#!@#!@#!@#', interaction, actions);
    const i2 = await scenario.getNextInteraction(actions[0]);
    const a2 = await scenario.getActions();
    console.log('@#!@#!@#!@#!@#', i2, a2);
    const i3 = await scenario.getNextInteraction(a2.find((action) => action.text === 'Попробовать сюжет') ?? a2[0]);
    const a3 = await scenario.getActions();
    console.log('@#!@#!@#!@#!@#', i3, a3);
  } catch (err) {
    console.error('@@@@@@@@@', err);
  }

  // on application exit:
  await scenario.destroy();
  await driver.close();
};

connect();
