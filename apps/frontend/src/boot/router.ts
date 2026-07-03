import { boot } from 'quasar/wrappers';
import router from '../router';

export default boot(({ app }) => {
  app.use(router);
});
