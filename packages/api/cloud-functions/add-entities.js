const glob = require('glob');
const path = require('path');
const fs = require('fs');

/**
 * Looks for all *.entity.{js,ts} files and generates import statements for them. After all the import statements,
 * adds an inline const definition for all the imported names which can then be used by the script.
 * @returns {string}
 */
function getEntityImports() {
  const imports = glob
    .sync(path.join(__dirname, '../src/**/*.entity.{js,ts}'))
    .reduce(
      (acc, entityPath) => {
        const { names, importsString } = acc;
        const [entityNameRaw] = entityPath.match(
          /[^/]+(?=\.entity\.(?:js|ts)$)/,
        );
        const nameParts = entityNameRaw.split('-');
        const entityName = nameParts
          .map((name) => name[0].toUpperCase() + name.slice(1))
          .join('');

        const relativePath = path.relative(__dirname, entityPath);
        return {
          names: [...names, entityName],
          importsString: `${importsString}import * as ${entityName} from '${relativePath.slice(
            0,
            -3,
          )}';\n`,
        };
      },
      { names: [], importsString: '' },
    );
  return `${imports.importsString}\nconst dbEntities = [${imports.names.join(
    ', ',
  )}];`;
}

const source = './cloud-functions/index.ts';
const target = './cloud-functions/main.ts';

fs.readFile(source, 'utf8', (err, data) => {
  if (err) throw err;

  const modifiedContent = data.replace(
    '// import-all-entities',
    getEntityImports(),
  );

  fs.writeFile(target, modifiedContent, 'utf8', (err1) => {
    if (err1) throw err1;
  });
});
