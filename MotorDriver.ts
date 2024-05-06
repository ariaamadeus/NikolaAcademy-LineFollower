enum Motor {
  //% block="A"
  A = 0x1,
  //% block="B"
  B = 0x2,
}

enum Servo {
  //% block="S0"
  S0 = 0x1,
  //% block="S1"
  S1 = 0x2,
  //% block="S2"
  S2 = 0x3,
}

enum MatchMode {
  //% block="Exactly To"
  Exact = 0x1,
  //% block="Contains"
  Contains = 0x2,
  //% block="Contains Inverted"
  ContainsInv = 0x2,
}

enum Dir {
  //% block="Forward"
  forward = 0x1,
  //% block="Backward"
  backward = 0x2,
}

let PWMA = AnalogPin.P8;
let AIN1 = DigitalPin.P13;
let AIN2 = DigitalPin.P12;
let PWMB = AnalogPin.P16;
let BIN1 = DigitalPin.P14;
let BIN2 = DigitalPin.P15;

//Replace the Servo to Dariyan-X 16CH's reading.
let outPin = [AnalogPin.P2, AnalogPin.P1, AnalogPin.P0, AnalogPin.P3]; //Out1, Out2, Out3, Out4
let IN1 = AnalogPin.P6;
let IN2 = AnalogPin.P4;

let IRreading = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

let inSequence = [
  [0, 0],
  [0, 1023],
  [1023, 1023],
  [1023, 0],
];
let readingSequence = [
  [6, 8, 14, 3],
  [5, 11, 13, 0],
  [7, 10, 15, 1],
  [4, 9, 12, 2],
];

//% weight=20 color=#3333FF icon="\uf1b9"
//% groups='["Motor", "IR"]'
namespace MotorDriver {
  /**
   * Motor Run
   * @param speed [0-16] speed of Motor; eg: 10, 0, 16
   */
  //% blockId=MotorDriver_MotorRun block="Motor %m|index %index|speed %speed"
  //% weight=100
  //% speed.min=0 speed.max=1023
  //% group="Motor"
  export function MotorRun(m: Motor, index: Dir, speed: number): void {
    if (m == Motor.A) {
      pins.analogWritePin(PWMA, speed);
      if (index == Dir.forward) {
        pins.digitalWritePin(AIN1, 0);
        pins.digitalWritePin(AIN2, 1);
      } else {
        pins.digitalWritePin(AIN1, 1);
        pins.digitalWritePin(AIN2, 0);
      }
    } else {
      pins.analogWritePin(PWMB, speed);
      if (index == Dir.forward) {
        pins.digitalWritePin(BIN1, 0);
        pins.digitalWritePin(BIN2, 1);
      } else {
        pins.digitalWritePin(BIN1, 1);
        pins.digitalWritePin(BIN2, 0);
      }
    }
  }

  //% blockId=MotorStop
  //% block="Motor %Motor| Stop"
  //% weight=90
  //% group="Motor"
  export function MotorStop(m: Motor): void {
    if (m == Motor.A) pins.analogWritePin(PWMA, 0);
    else pins.analogWritePin(PWMB, 0);
  }

  //% block="IR Reading"
  //% blockId = IRReading
  //% weight=80 blockGap=8
  //% group="IR"
  export function IRReading(): string {
    IRreading = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      pins.analogWritePin(IN1, inSequence[i][0]);
      pins.analogWritePin(IN2, inSequence[i][1]);
      for (let j = 0; j < 4; j++) {
        IRreading[readingSequence[i][j]] = pins.analogReadPin(outPin[j]);
      }
    }
    let readingString = "";
    for (let i = 0; i < IRreading.length; i++) {
      if (IRreading[i] > 512) readingString += "1";
      else readingString += "0";
    }
    return readingString;
  }

  /**
   * For Matching the read.
   * @param matchers contains 16 string [0 or 1]"
   * @param mode Exact, Contains, or Contains Inverted"
   */
  //% block="Matching Reading %mode  $matchers|"
  //% blockId = exactMatch
  //% weight=85 blockGap=8
  //% group="IR"
  export function exactMatch(matchers: string, mode: MatchMode): boolean {
    matchers.replace(" ", "");
    // if (matchers.length < 16) basic.showString(":/0");
    IRreading = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      pins.analogWritePin(IN1, inSequence[i][0]);
      pins.analogWritePin(IN2, inSequence[i][1]);
      for (let j = 0; j < 4; j++) {
        IRreading[readingSequence[i][j]] = pins.analogReadPin(outPin[j]);
      }
    }
    if (mode == MatchMode.Exact) {
      for (let i = 0; i < 16; i++) {
        if (matchers[i] == "1") {
          if (IRreading[i] < 512) return false;
        } else {
          if (IRreading[i] >= 512) return false;
        }
      }
    } else if (mode == MatchMode.Contains) {
      for (let i = 0; i < 16; i++) {
        if (matchers[i] == "1") {
          if (IRreading[i] < 512) return false;
        }
      }
    } else if (mode == MatchMode.ContainsInv) {
      for (let i = 0; i < 16; i++) {
        if (matchers[i] == "1") {
          if (IRreading[i] >= 512) return false;
        }
      }
    }
    return true;
  }
}
