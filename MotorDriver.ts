enum Motor {
  //% block="A"
  A = 0x1,
  //% block="B"
  B = 0x2,
}

enum MatchMode {
  //% block="Exactly To"
  Exact = 0x1,
  //% block="Contains Exactly To"
  ContainsExact = 0x2,
  //% block="Contains Exactly To Inverted"
  ContainsInvExact = 0x3,
  //% block="Contains"
  Contains = 0x4,
  //% block="Contains Inverted"
  ContainsInv = 0x5,
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
let OUT1 = AnalogPin.P2;
let OUT2 = AnalogPin.P1;
let OUT3 = AnalogPin.P0;
let OUT4 = AnalogPin.P3;
let IN1 = AnalogPin.P6;
let IN2 = AnalogPin.P4;

let IRreading = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let IRMINreading = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let IRMAXreading = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let IRAVGreading = [512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512];

let inSequence = [
  [0, 0],
  [0, 1023],
  [1023, 0],
  [1023, 1023],
];
let readingSequence = [
  [6, 8, 14, 3],
  [5, 11, 13, 0],
  [4, 9, 12, 2],
  [7, 10, 15, 1],
];

//% weight=20 color=#3333FF icon="\uf1b9"
namespace MotorDriver {
  /**
   * Motor Run
   * @param speed [0-16] speed of Motor; eg: 10, 0, 16
   */
  //% blockId=MotorDriver_MotorRun block="Motor %m|index %index|speed %speed"
  //% weight=100
  //% speed.min=0 speed.max=1023
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
  export function MotorStop(m: Motor): void {
    if (m == Motor.A) pins.analogWritePin(PWMA, 0);
    else pins.analogWritePin(PWMB, 0);
  }

  //% blockId=setMin
  //% block = "Tare White"
  //% weight=79

  export function setMin(): void {
    basic.pause(100);
    pins.analogWritePin(AnalogPin.P6, 0);
    pins.analogWritePin(AnalogPin.P4, 0);
    basic.pause(100);
    IRMINreading[6] = pins.analogReadPin(AnalogPin.P2);
    IRMINreading[8] = pins.analogReadPin(AnalogPin.P1);
    IRMINreading[14] = pins.analogReadPin(AnalogPin.P0);
    IRMINreading[3] = pins.analogReadPin(AnalogPin.P3);
    basic.pause(100);
    pins.analogWritePin(AnalogPin.P6, 0);
    pins.analogWritePin(AnalogPin.P4, 1023);
    basic.pause(100);
    IRMINreading[5] = pins.analogReadPin(AnalogPin.P2);
    IRMINreading[11] = pins.analogReadPin(AnalogPin.P1);
    IRMINreading[13] = pins.analogReadPin(AnalogPin.P0);
    IRMINreading[0] = pins.analogReadPin(AnalogPin.P3);
    basic.pause(100);
    pins.analogWritePin(AnalogPin.P6, 1023);
    pins.analogWritePin(AnalogPin.P4, 0);
    basic.pause(100);
    IRMINreading[4] = pins.analogReadPin(AnalogPin.P2);
    IRMINreading[9] = pins.analogReadPin(AnalogPin.P1);
    IRMINreading[12] = pins.analogReadPin(AnalogPin.P0);
    IRMINreading[2] = pins.analogReadPin(AnalogPin.P3);
    basic.pause(100);
    pins.analogWritePin(AnalogPin.P6, 1023);
    pins.analogWritePin(AnalogPin.P4, 1023);
    basic.pause(100);
    IRMINreading[7] = pins.analogReadPin(AnalogPin.P2);
    IRMINreading[10] = pins.analogReadPin(AnalogPin.P1);
    IRMINreading[15] = pins.analogReadPin(AnalogPin.P0);
    IRMINreading[1] = pins.analogReadPin(AnalogPin.P3);
    basic.pause(100);
    for (let i = 0; i <= 15; i++) {
      IRAVGreading[i] = IRMINreading[i] + (IRMAXreading[i] - IRMINreading[i]) / 2;
    }
  }

  //% blockId=setMax
  //% block = "Tare Black"
  //% weight=69
  export function setMax(): void {
    basic.pause(100);
    pins.analogWritePin(AnalogPin.P6, 0);
    pins.analogWritePin(AnalogPin.P4, 0);
    basic.pause(100);
    IRMAXreading[6] = pins.analogReadPin(AnalogPin.P2);
    IRMAXreading[8] = pins.analogReadPin(AnalogPin.P1);
    IRMAXreading[14] = pins.analogReadPin(AnalogPin.P0);
    IRMAXreading[3] = pins.analogReadPin(AnalogPin.P3);
    basic.pause(100);
    pins.analogWritePin(AnalogPin.P6, 0);
    pins.analogWritePin(AnalogPin.P4, 1023);
    basic.pause(100);
    IRMAXreading[5] = pins.analogReadPin(AnalogPin.P2);
    IRMAXreading[11] = pins.analogReadPin(AnalogPin.P1);
    IRMAXreading[13] = pins.analogReadPin(AnalogPin.P0);
    IRMAXreading[0] = pins.analogReadPin(AnalogPin.P3);
    basic.pause(100);
    pins.analogWritePin(AnalogPin.P6, 1023);
    pins.analogWritePin(AnalogPin.P4, 0);
    basic.pause(100);
    IRMAXreading[4] = pins.analogReadPin(AnalogPin.P2);
    IRMAXreading[9] = pins.analogReadPin(AnalogPin.P1);
    IRMAXreading[12] = pins.analogReadPin(AnalogPin.P0);
    IRMAXreading[2] = pins.analogReadPin(AnalogPin.P3);
    basic.pause(100);
    pins.analogWritePin(AnalogPin.P6, 1023);
    pins.analogWritePin(AnalogPin.P4, 1023);
    basic.pause(100);
    IRMAXreading[7] = pins.analogReadPin(AnalogPin.P2);
    IRMAXreading[10] = pins.analogReadPin(AnalogPin.P1);
    IRMAXreading[15] = pins.analogReadPin(AnalogPin.P0);
    IRMAXreading[1] = pins.analogReadPin(AnalogPin.P3);
    basic.pause(100);
    for (let i = 0; i <= 15; i++) {
      IRAVGreading[i] = IRMINreading[i] + (IRMAXreading[i] - IRMINreading[i]) / 2;
    }
  }

  //% blockId=IRReading
  //% block = "Infrared Read"
  //% weight=69
  export function IRReading(): void {
    IRreading = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      pins.analogWritePin(IN1, inSequence[i][0]);
      pins.analogWritePin(IN2, inSequence[i][1]);
      basic.pause(20);
      IRreading[readingSequence[i][0]] = pins.analogReadPin(OUT1);
      IRreading[readingSequence[i][1]] = pins.analogReadPin(OUT2);
      IRreading[readingSequence[i][2]] = pins.analogReadPin(OUT3);
      IRreading[readingSequence[i][3]] = pins.analogReadPin(OUT4);
    }
  }

  /**
   * Follow the line!.
   * @param speed Normal speed of the robot"
   * @param P Proportional from PID"
   */
  //% blockId=PIDLineFollow
  //% block = "Line Follow speed %speed| P %P"
  //% weight=68

  export function PIDLineFollow(speed: number, P: number): void {
    //set both motor forward
    pins.digitalWritePin(AIN1, 0);
    pins.digitalWritePin(AIN2, 1);
    pins.digitalWritePin(BIN1, 0);
    pins.digitalWritePin(BIN2, 1);

    //target = 15/2 = 7.5
    let sum = 0;
    let n = 0;
    for (let i = 0; i <= 15; i++) {
      if (IRreading[i] >= IRAVGreading[i]) {
        sum = sum + i;
        n++;
      }
    }
    let err = 0;
    if (n > 0) err = sum / n - 7.5;
    pins.analogWritePin(PWMA, speed - err * P);
    pins.analogWritePin(PWMB, speed + err * P);
  }

  /**
   * For Matching the read.
   * @param matchers contains 16 string [0 or 1]"
   * @param mode Exact, Contains, or Contains Inverted"
   */
  //% blockId=exactMatch
  //% block="Matching Reading %mode  $matchers|"
  //% weight=80 blockGap=8
  export function exactMatch(matchers: string, mode: MatchMode): boolean {
    matchers = matchers.replace(" ", "");
    // if (matchers.length < 16) basic.showString(":/0");

    if (mode == MatchMode.Exact) {
      for (let i = 0; i < 16; i++) {
        if (matchers[i] == "1") {
          if (IRreading[i] < IRAVGreading[i]) return false;
        } else {
          if (IRreading[i] >= IRAVGreading[i]) return false;
        }
      }
    } else if (mode == MatchMode.ContainsExact) {
      for (let i = 0; i < 16; i++) {
        if (matchers[i] == "1") {
          if (IRreading[i] < IRAVGreading[i]) return false;
        }
      }
    } else if (mode == MatchMode.ContainsInvExact) {
      for (let i = 0; i < 16; i++) {
        if (matchers[i] == "1") {
          if (IRreading[i] >= IRAVGreading[i]) return false;
        }
      }
    } else if (mode == MatchMode.Contains) {
      for (let i = 0; i < 16; i++) {
        if (matchers[i] == "1") {
          if (IRreading[i] >= IRAVGreading[i]) return true;
        }
      }
      return false;
    } else if (mode == MatchMode.ContainsInv) {
      for (let i = 0; i < 16; i++) {
        if (matchers[i] == "1") {
          if (IRreading[i] < IRAVGreading[i]) return true;
        }
      }
      return false;
    }
    return true;
  }
}
