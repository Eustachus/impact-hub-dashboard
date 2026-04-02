const { rm } = require("fs");
rm(".next", { recursive: true, force: true }, () => {});
