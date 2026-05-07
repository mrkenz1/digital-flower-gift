const QR_VERSION = 5;
const QR_SIZE = QR_VERSION * 4 + 17;
const DATA_CODEWORDS = 108;
const ECC_CODEWORDS = 26;

function addBits(buffer, value, length) {
  for (let i = length - 1; i >= 0; i -= 1) {
    buffer.push(((value >>> i) & 1) === 1);
  }
}

function createByteData(text) {
  const bytes = [...new TextEncoder().encode(text)];
  const capacityBits = DATA_CODEWORDS * 8;
  const bits = [];

  addBits(bits, 0b0100, 4);
  addBits(bits, bytes.length, 8);
  bytes.forEach((byte) => addBits(bits, byte, 8));
  addBits(bits, 0, Math.min(4, capacityBits - bits.length));

  while (bits.length % 8 !== 0) {
    bits.push(false);
  }

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) {
      value = (value << 1) | (bits[i + j] ? 1 : 0);
    }
    data.push(value);
  }

  for (let pad = 0; data.length < DATA_CODEWORDS; pad += 1) {
    data.push(pad % 2 === 0 ? 0xec : 0x11);
  }

  return data;
}

function createGaloisTables() {
  const exp = new Array(512);
  const log = new Array(256);
  let value = 1;

  for (let i = 0; i < 255; i += 1) {
    exp[i] = value;
    log[value] = i;
    value <<= 1;
    if (value & 0x100) {
      value ^= 0x11d;
    }
  }

  for (let i = 255; i < 512; i += 1) {
    exp[i] = exp[i - 255];
  }

  return { exp, log };
}

const GF = createGaloisTables();

function gfMultiply(a, b) {
  if (a === 0 || b === 0) {
    return 0;
  }
  return GF.exp[GF.log[a] + GF.log[b]];
}

function multiplyPolynomials(a, b) {
  const result = new Array(a.length + b.length - 1).fill(0);

  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      result[i + j] ^= gfMultiply(a[i], b[j]);
    }
  }

  return result;
}

function createGeneratorPolynomial(degree) {
  let result = [1];

  for (let i = 0; i < degree; i += 1) {
    result = multiplyPolynomials(result, [1, GF.exp[i]]);
  }

  return result;
}

function createErrorCorrection(data) {
  const generator = createGeneratorPolynomial(ECC_CODEWORDS);
  const message = [...data, ...new Array(ECC_CODEWORDS).fill(0)];

  for (let i = 0; i < data.length; i += 1) {
    const coefficient = message[i];
    if (coefficient === 0) {
      continue;
    }

    for (let j = 0; j < generator.length; j += 1) {
      message[i + j] ^= gfMultiply(generator[j], coefficient);
    }
  }

  return message.slice(data.length);
}

function createMatrix(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function setFunctionModule(modules, reserved, x, y, value) {
  modules[y][x] = value;
  reserved[y][x] = true;
}

function drawFinder(modules, reserved, centerX, centerY) {
  for (let y = -4; y <= 4; y += 1) {
    for (let x = -4; x <= 4; x += 1) {
      const xx = centerX + x;
      const yy = centerY + y;
      if (xx < 0 || yy < 0 || xx >= QR_SIZE || yy >= QR_SIZE) {
        continue;
      }
      const distance = Math.max(Math.abs(x), Math.abs(y));
      setFunctionModule(modules, reserved, xx, yy, distance !== 2 && distance !== 4);
    }
  }
}

function drawAlignment(modules, reserved, centerX, centerY) {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1) {
      const distance = Math.max(Math.abs(x), Math.abs(y));
      setFunctionModule(modules, reserved, centerX + x, centerY + y, distance !== 1);
    }
  }
}

function drawFunctionPatterns(modules, reserved) {
  drawFinder(modules, reserved, 3, 3);
  drawFinder(modules, reserved, QR_SIZE - 4, 3);
  drawFinder(modules, reserved, 3, QR_SIZE - 4);
  drawAlignment(modules, reserved, 30, 30);

  for (let i = 8; i < QR_SIZE - 8; i += 1) {
    const value = i % 2 === 0;
    setFunctionModule(modules, reserved, 6, i, value);
    setFunctionModule(modules, reserved, i, 6, value);
  }

  drawFormatBits(modules, reserved, 0);
  setFunctionModule(modules, reserved, 8, QR_SIZE - 8, true);
}

function getFormatBits(mask) {
  const errorCorrectionLevel = 1;
  const data = (errorCorrectionLevel << 3) | mask;
  let bits = data << 10;

  for (let i = 14; i >= 10; i -= 1) {
    if (((bits >>> i) & 1) !== 0) {
      bits ^= 0x537 << (i - 10);
    }
  }

  return ((data << 10) | bits) ^ 0x5412;
}

function drawFormatBits(modules, reserved, mask) {
  const bits = getFormatBits(mask);
  const bit = (index) => ((bits >>> index) & 1) !== 0;

  for (let i = 0; i <= 5; i += 1) setFunctionModule(modules, reserved, 8, i, bit(i));
  setFunctionModule(modules, reserved, 8, 7, bit(6));
  setFunctionModule(modules, reserved, 8, 8, bit(7));
  setFunctionModule(modules, reserved, 7, 8, bit(8));
  for (let i = 9; i < 15; i += 1) setFunctionModule(modules, reserved, 14 - i, 8, bit(i));

  for (let i = 0; i < 8; i += 1) setFunctionModule(modules, reserved, QR_SIZE - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i += 1) setFunctionModule(modules, reserved, 8, QR_SIZE - 15 + i, bit(i));
  setFunctionModule(modules, reserved, 8, QR_SIZE - 8, true);
}

function placeCodewords(modules, reserved, codewords) {
  let bitIndex = 0;
  let upward = true;

  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right -= 1;
    }

    for (let vertical = 0; vertical < QR_SIZE; vertical += 1) {
      const y = upward ? QR_SIZE - 1 - vertical : vertical;

      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        if (reserved[y][x]) {
          continue;
        }

        const byte = codewords[Math.floor(bitIndex / 8)] ?? 0;
        const value = ((byte >>> (7 - (bitIndex % 8))) & 1) !== 0;
        modules[y][x] = value;
        bitIndex += 1;
      }
    }

    upward = !upward;
  }
}

function getMask(mask, x, y) {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return false;
  }
}

function applyMask(source, reserved, mask) {
  const modules = source.map((row) => [...row]);

  for (let y = 0; y < QR_SIZE; y += 1) {
    for (let x = 0; x < QR_SIZE; x += 1) {
      if (!reserved[y][x] && getMask(mask, x, y)) {
        modules[y][x] = !modules[y][x];
      }
    }
  }

  return modules;
}

function getPenalty(modules) {
  let penalty = 0;

  const countRuns = (getModule) => {
    for (let i = 0; i < QR_SIZE; i += 1) {
      let runColor = getModule(i, 0);
      let runLength = 1;

      for (let j = 1; j < QR_SIZE; j += 1) {
        const color = getModule(i, j);
        if (color === runColor) {
          runLength += 1;
          continue;
        }
        if (runLength >= 5) penalty += runLength - 2;
        runColor = color;
        runLength = 1;
      }
      if (runLength >= 5) penalty += runLength - 2;
    }
  };

  countRuns((row, column) => modules[row][column]);
  countRuns((column, row) => modules[row][column]);

  for (let y = 0; y < QR_SIZE - 1; y += 1) {
    for (let x = 0; x < QR_SIZE - 1; x += 1) {
      const color = modules[y][x];
      if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) {
        penalty += 3;
      }
    }
  }

  let dark = 0;
  modules.forEach((row) => row.forEach((value) => { if (value) dark += 1; }));
  const total = QR_SIZE * QR_SIZE;
  penalty += Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10;
  return penalty;
}

export function createQrMatrix(text) {
  const encoded = new TextEncoder().encode(text);
  if (encoded.length > 106) {
    throw new Error("QR text is too long for the built-in generator.");
  }

  const modules = createMatrix(QR_SIZE);
  const reserved = createMatrix(QR_SIZE).map((row) => row.map(() => false));
  const data = createByteData(text);
  const codewords = [...data, ...createErrorCorrection(data)];

  drawFunctionPatterns(modules, reserved);
  placeCodewords(modules, reserved, codewords);

  let bestMask = 0;
  let bestModules = modules;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = applyMask(modules, reserved, mask);
    drawFormatBits(candidate, reserved, mask);
    const penalty = getPenalty(candidate);
    if (penalty < bestPenalty) {
      bestMask = mask;
      bestModules = candidate;
      bestPenalty = penalty;
    }
  }

  drawFormatBits(bestModules, reserved, bestMask);
  return { size: QR_SIZE, modules: bestModules };
}
