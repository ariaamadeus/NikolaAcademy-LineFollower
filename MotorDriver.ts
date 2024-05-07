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

led.plot(3, 0);
led.plot(3, 1);
led.plot(3, 2);
led.plot(3, 3);
led.plot(3, 4);

let inSequence = [0, 3, 0, 3];
let readingSequence = [
  [6, 8, 14, 3],
  [4, 9, 12, 2],
  [7, 10, 15, 1],
  [5, 11, 13, 0],
];
let lastError = 0;
let doneWhite = false;
let doneBlack = false;

//% weight=20 color=#3333FF icon="\uf1b9"
//$
namespace LineFollower {
  /**
   * Motor Run
   * @param speed [0-16] speed of Motor; eg: 150, 0, 1023
   */
  //% blockId=LineFollower_MotorRun block="motor %m|index %index|speed %speed"
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

  //% blockId=motorstop
  //% block="motor %Motor| stop"
  //% weight=90
  export function MotorStop(m: Motor): void {
    if (m == Motor.A) pins.analogWritePin(PWMA, 0);
    else pins.analogWritePin(PWMB, 0);
  }

  //% block="calibrate white" blockId=tareWhite
  //% weight=80
  export function TareWhite(): void {
    for (let j = 0; j <= 3; j++) {
      if (j == 0 || j == 3) {
        for (let x = 0; x <= 4; x++) {
          led.plot(inSequence[j], x);
        }
      } else {
        for (let x2 = 0; x2 <= 4; x2++) {
          led.unplot(inSequence[j], x2);
        }
      }
      basic.pause(50);
      IRMINreading[readingSequence[j][0]] = pins.analogReadPin(OUT1);
      IRMINreading[readingSequence[j][1]] = pins.analogReadPin(OUT2);
      IRMINreading[readingSequence[j][2]] = pins.analogReadPin(OUT3);
      IRMINreading[readingSequence[j][3]] = pins.analogReadPin(OUT4);
      basic.pause(50);
    }
    for (let i = 0; i <= 15; i++) {
      IRAVGreading[i] = IRMINreading[i] + (IRMAXreading[i] - IRMINreading[i]) * (25 / 100);
    }
    doneWhite = true;
  }

  //% block="calibrate black" blockId=tareBlack
  //% weight=80
  export function TareBlack(): void {
    for (let j = 0; j <= 3; j++) {
      if (j == 0 || j == 3) {
        for (let x = 0; x <= 4; x++) {
          led.plot(inSequence[j], x);
        }
      } else {
        for (let x2 = 0; x2 <= 4; x2++) {
          led.unplot(inSequence[j], x2);
        }
      }
      basic.pause(50);
      IRMAXreading[readingSequence[j][0]] = pins.analogReadPin(OUT1);
      IRMAXreading[readingSequence[j][1]] = pins.analogReadPin(OUT2);
      IRMAXreading[readingSequence[j][2]] = pins.analogReadPin(OUT3);
      IRMAXreading[readingSequence[j][3]] = pins.analogReadPin(OUT4);
      basic.pause(50);
    }
    for (let i = 0; i <= 15; i++) {
      IRAVGreading[i] = IRMINreading[i] + (IRMAXreading[i] - IRMINreading[i]) * (25 / 100);
    }
    doneBlack = true;
  }
  //% block="calibrating" blockId=doneCal
  //% weight=81
  export function getCalibrateDone(): boolean {
    return !(doneWhite && doneBlack);
  }

  //% block="sensor read" blockId=ir_reading
  //% weight=85
  export function irreading(): void {
    IRreading = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let j = 0; j <= 3; j++) {
      if (j == 0 || j == 3) {
        for (let x = 0; x <= 4; x++) {
          led.plot(inSequence[j], x);
          // basic.pause(200)
        }
      } else {
        for (let x2 = 0; x2 <= 4; x2++) {
          led.unplot(inSequence[j], x2);
          // basic.pause(200)
        }
      }
      // pins.analogWritePin(IN1, inSequence[i][0]);
      // pins.analogWritePin(IN2, inSequence[i][1]);
      basic.pause(2);
      IRreading[readingSequence[j][0]] = pins.analogReadPin(OUT1);
      IRreading[readingSequence[j][1]] = pins.analogReadPin(OUT2);
      IRreading[readingSequence[j][2]] = pins.analogReadPin(OUT3);
      IRreading[readingSequence[j][3]] = pins.analogReadPin(OUT4);
    }
  }

  /**
   * Follow the line!.
   * @param speed Normal speed of the robot; eg: 400, 0, 1023
   * @param P Proportional from PID; eg: 70, 0, 1000
   * @param D Proportional from PID; eg: 50, 0, 1000
   */
  //% blockId=lfPid
  //% block="line follow speed %speed| P %P| D %D"
  //% weight=68
  //% speed.min=0 speed.max=1023
  export function lineFollowPID(speed: number, P: number, D: number): void {
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
    let PD = P * err + D * (err - lastError);
    lastError = err;

    let ASpeed = 0;
    let BSpeed = 0;

    if (ASpeed < 0) {
      pins.digitalWritePin(AIN1, 1);
      pins.digitalWritePin(AIN2, 0);
    } else {
      pins.digitalWritePin(AIN1, 0);
      pins.digitalWritePin(AIN2, 1);
    }
    if (BSpeed < 0) {
      pins.digitalWritePin(BIN1, 1);
      pins.digitalWritePin(BIN2, 0);
    } else {
      pins.digitalWritePin(BIN1, 0);
      pins.digitalWritePin(BIN2, 1);
    }
    pins.analogWritePin(PWMA, speed - PD);
    pins.analogWritePin(PWMB, speed + PD);
  }

  /**
   * For Matching the read.
   * @param matchers contains 16 string; eg: "0000 0000 0000 0000", "1111 11111111 1111"
   * @param mode Exact, Contains, or Contains Inverted"
   */
  //% blockId=exactMatch
  //% block="Matching Reading %mode $matchers|"
  //% weight=40 blockGap=8
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
