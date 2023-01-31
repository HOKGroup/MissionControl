import { ZombieLog } from "../../api/schema/zombieLogs";

interface VersionCompareOptions {
  lexicographical?: boolean;
  zeroExtend?: boolean;
}

export const versionCompare = (
  v1: string,
  v2: string,
  options?: VersionCompareOptions
): number => {
  const lexicographical = options && options.lexicographical;
  const zeroExtend = options && options.zeroExtend;

  let v1parts: string[] | number[] = v1.split(".");
  let v2parts: string[] | number[] = v2.split(".");

  function isValidPart(x: string) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (let i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      return 1;
    }

    if (v1parts[i] === v2parts[i]) {
      // continue
    } else if (v1parts[i] > v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  if (v1parts.length !== v2parts.length) {
    return -1;
  }

  return 0;
};

export const getVersion = (s: string): string => {
  const myRegexp = /Version:\s?(.*?)$/g;
  const myRegexp1 = /version:\s?(.*?)$/g;
  const match = myRegexp.exec(s);
  const match1 = myRegexp1.exec(s);
  if (match !== null) {
    return match[1];
  }
  if (match1 !== null) {
    return match1[1];
  }
  return "Fatal";
};

export const parseDateTime = (value: Date) => {
  return value.toLocaleString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const parseLocation = ({ machine }: ZombieLog) => {
  if (!machine) {
    return "N/A";
  }

  const parts = machine.split("-");
  return parts[0];
};

export const parseMachine = ({ machine }: ZombieLog) => {
  if (!machine) {
    return "N/A";
  }

  const parts = machine.split("-");

  if (parts.length > 2) {
    return parts[1] + "-" + parts[2];
  } else {
    return parts[1];
  }
};

export const parseUsername = (
  machineUsers: Record<string, string>,
  { machine }: ZombieLog
) => {
  if (!machine) {
    return "N/A";
  }

  if (Object.prototype.hasOwnProperty.call(machineUsers, machine)) {
    return machineUsers[machine];
  } else {
    return "Unknown";
  }
};
