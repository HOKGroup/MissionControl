import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowDownShortWide } from "@fortawesome/free-solid-svg-icons";
import { faArrowDownWideShort } from "@fortawesome/free-solid-svg-icons";
import { faArrowUpLong } from "@fortawesome/free-solid-svg-icons";
import { faArrowDownLong } from "@fortawesome/free-solid-svg-icons";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

function registerIcons() {
  library.add(
    faArrowDownLong,
    faArrowDownShortWide,
    faArrowDownWideShort,
    faArrowUpLong,
    faAsterisk,
    faCalendar,
    faCaretDown,
    faCaretRight,
    faCheck,
    faCog,
    faPlus,
    faSpinner
  );
}

export default registerIcons;
