import { web } from "./application/web.js";
import { logger } from "./application/logging.js";

const PORT = process.env.PORT || 4000;
web.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});