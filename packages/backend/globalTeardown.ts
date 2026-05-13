import { TestContainer } from './test/testContainer';

module.exports = async function () {
  await TestContainer.stop();
};
