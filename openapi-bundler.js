const exec = require("child_process").exec;
const chokidar = require("chokidar");
const packageJSON = require("./package.json");

const defaultDocfiles = [
  {
    path: "./openapi/v1.yaml",
    out: "./content/openapi/v1.yaml",
    name: "V1",
  },
];

const docs =
  Array.isArray(packageJSON.docfiles) && packageJSON.docfiles.length > 0
    ? packageJSON.docfiles
    : defaultDocfiles;

function bundleDocDef(doc) {
  exec(
    `openapi bundle ${doc.path} -o ${doc.out}`,
    function (error, stdout, stderr) {
      console.log(`Doc "${doc.name}" bundled`);
    }
  );
}

const DEFAULT_OPTIONS = {
  delay: 250,
  events: ["add", "change", "unlink"],
  fireFirst: false,
  fireLast: true,
  chokidarOptions: {
    ignoreInitial: true,
    followSymlinks: false,
  },
};

function watch(paths = [], options = {}, callback = () => {}) {
  options = { ...DEFAULT_OPTIONS, ...options };
  const watcher = chokidar.watch(paths, options.chokidarOptions);

  const debounceEvent =
    (callback, time = DEFAULT_OPTIONS.delay, interval) =>
    (...args) => {
      clearTimeout(interval);
      interval = setTimeout(
        () => (options.fireLast ? callback(...args) : () => {}),
        time
      );
    };

  function onChange(event, path, stats, error) {
    if (error && watcher.listenerCount("error")) {
      watcher.emit("error", error);
      return;
    }

    if (options.fireFirst) {
      callback(event, path, stats);
    }

    debounceEvent(callback(event, path, stats), 250);
  }

  options.events.forEach((event) => {
    if (
      ["add", "change", "unlink", "addDir", "unlinkDir"].indexOf(event) !== -1
    ) {
      watcher.on(event, (path) => onChange(event, path, null, null));
    } else if (event === "change") {
      watcher.on(event, (path, stats) => onChange(event, path, stats, null));
    } else if (event === "error") {
      watcher.on(event, (error) => onChange(event, "", null, error));
    } else if (event === "ready") {
      watcher.on(event, () => onChange(event, "", null, null));
    } else if (event === "raw") {
      watcher.on(event, (event, path, details) =>
        onChange(event, path, details, null)
      );
    }
  });

  return watcher;
}

if(process.argv.includes('watch')) {
  watch(
    "openapi/",
    {
      fireFirst: false,
      fireLast: false,
    },
    (event, path, stats, error) => {
      if (error) {
        console.error(error);
      }
      docs.forEach(bundleDocDef);
    }
  );
}

docs.forEach(bundleDocDef);
