import { shuffle, sortBy } from 'underscore';
import { formatDistance, differenceInHours, getDaysInMonth, formatDate, format } from 'date-fns';
import { daysInWeek } from "date-fns/constants";
import { isSameWeek, groupByWeek, DatesWithinRange } from './date.functions';
import { shift_schedules, employees, leaves } from "../models";

interface IEmployee {
    id: number;
    name: string;
}

class Employee implements IEmployee {
    id: number;
    name: string;
    shifts: IShift[]

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.shifts = [];
    }

    addShift(shift: IShift) {
        this.shifts.push(shift)
    }

    removeShift(id: number) {
        this.shifts.splice(id, 1);
    }
}

interface IShift {
    id: number;
    start_time: string;
    end_time: string;
    name: string;
    employees: IEmployee[];
}

/**
 * Shift capture the whole day
 */
class Shift implements IShift {
    id: number;
    name: string;
    start_time: string; // time period
    end_time: string; // time period
    employees: IEmployee[];

    constructor(id: number, start_time: string, end_time: string, name: string) {
        this.id = id;
        this.start_time = start_time;
        this.end_time = end_time;
        this.name = name;
    }

}

interface ISchedule {
    id: number;
    start: Date;
    end: Date;
    name: string;
    shifts: IShift[];
}

/**
 * Schedule capture the whole week
 */
class Schedule implements ISchedule {
    id: number;
    start: Date;
    end: Date;
    name: string;
    shifts: IShift[];

    constructor(id: number, start: Date, end: Date, name: string, shifts: IShift[]) {
        this.id = id;
        this.start = start;
        this.end = end;
        this.name = name;
        this.shifts = shifts;
    }
}

interface IRoster {
    id: number;
    start_date: Date;
    end_date: Date;
    schedules: ISchedule[];
}

/**
 * Roster capture the whole month
 */
class Roster implements IRoster {
    id: number;
    start_date: Date;
    end_date: Date;
    schedules: ISchedule[];
}

class ShiftScheduler {
    shifts: IShift[];
    schedules: ISchedule[];
    rosters: IRoster[];
    employees: IEmployee[];

    constructor(shifts: IShift[], schedules: ISchedule[], rosters: IRoster[]) {
        this.shifts = shifts;
        this.schedules = schedules;
        this.rosters = rosters;
    }

    generateSchedules(employees: IEmployee[]) {
        this.employees = employees;
        let size = this.employees.length;
        let shiftsTotal = this.shifts.length;

        // for each employee
        for (let i = 0; i < size; i++) {
            console.log(employees[i])

            // for each shift
            for (let j = 0; j < shiftsTotal; j++) {
                console.log(shifts[j])
            }
        }
    }
}

let shifts: IShift[] = [
    new Shift(1, "", "", "AM"),
    new Shift(2, "", "", "AM"),
    new Shift(3, "", "", "PM"),
    new Shift(4, "", "", "NS"),
    new Shift(5, "", "", "NS")
]

let schedules: ISchedule[] = [
    new Schedule(1, new Date(2024, 10, 28), new Date(2024, 11, 3), "October - November", shifts),
    new Schedule(2, new Date(2024, 11, 4), new Date(2024, 11, 10), "November 1", shifts),
    new Schedule(3, new Date(2024, 11, 11), new Date(2024, 11, 18), "November 2", shifts),
    new Schedule(4, new Date(2024, 11, 18), new Date(2024, 11, 24), "November 3", shifts),
]

let rosters = [
    new Roster()
]

let employees = [
    new Employee(1, "John"),
    new Employee(2, "Jane"),
    new Employee(3, "Maggie"),
    new Employee(4, "Holly"),
    new Employee(5, "Jolly"),
    new Employee(6, "Amy")
]

let shiftScheduler = new ShiftScheduler(shifts, schedules, rosters)
shiftScheduler.generateSchedules(employees);

async function satisfy_constraint(employees: IEmployee[], _max: number, _min: number, day: number) {
    for (const employeesKey of employees) {
        if (employeesKey.id) {
            return day
        }
    }
}

async function estimate_number(timePeriod: any[], availableEmployees: IEmployee[]) {
    return shifts;
}

function search_assignment(timePeriod, people_sft_t) {
    return 1
}

function decide_flextime(fa) {

}

async function feasibleSchedule(employees: IEmployee[], workload: any[], constrains: []) {
    let days = [1, 2, 3, 4, 5, 6, 7];
    let fa: number;

    for (let i = 0; i < days.length; i++) {
        let available_E = await satisfy_constraint(employees, constrains['max'], constrains['min'], days[i]);
        let people_sft_t = await estimate_number([], available_E);
        fa = search_assignment([], people_sft_t);
    }

    let fs = decide_flextime(fa)

    return fs;
}


// Constraints
let MAX_CONSECUTIVE_SHIFTS_PER_WEEK = 5;
let MAX_CONSECUTIVE_NIGHT_SHIFTS_PER_WEEK = 2;
let MAX_CONSECUTIVE_OFFDAY_PER_WEEK = 2;
let EXPECTED_NUM_OF_WORKING_DAYS_PER_WEEK = 7;
let MAX_CONSECUTIVE_LEAVE_PER_WEEK = 2;
let SHIFT_PATTERNS = [
    [5, 2], // 5 days work, 2 days off
    [3, 1] // 3 days work, 1 days off
];

const totalDays = getDaysInMonth(new Date()); // Total days to schedule

let holidays = [
    { name: "New Year's Day", date: "2024-01-01" },
    { name: "National Remembrance Day of the Late First Prime Minister, Great Grand Chief Hon Sir Michael Thomas Somare", date: "2024-02-26" },
    { name: "Good Friday", date: "2024-03-29" },
    { name: "Easter Sunday", date: "2024-03-31" },
    { name: "Easter Monday", date: "2024-04-01" },
    { name: "King's Birthday", date: "2024-06-17" },
    { name: "National Remembrance Day", date: "2024-07-23" },
    { name: "National Repentance Day", date: "2024-08-26" },
    { name: "Independence Day", date: "2024-09-16" },
    { name: "Christmas Day", date: "2024-12-25" },
    { name: "Boxing Day", date: "2024-12-26", eventColor: "red" }
];

export const public_holidays = holidays;

class Employee {
    id;
    available = [];
    schedule = [];
    shifts = [];

    /**
     *
     * @param id
     * @param availableFor - shifts available for this employee
     */
    constructor(id, name, type, availableFor) {
        this.id = id;
        this.available = availableFor;
        this.schedule = []; // List of assigned shifts
        this.shifts = [];

        this.name = name;
        this.type = type; // 'agent' or 'manager'
        this.consecutiveShifts = 0; // Count of consecutive shifts worked
        this.daysOff = 0; // Count of days off taken
    }

    get getId() {
        return this.id
    }

    get schedule() {
        return this.schedule;
    }

    // Method to count consecutive workdays
    countConsecutiveWorkdays() {
        let count = 0;
        for (let i = this.schedule.length - 1; i >= 0; i--) {
            if (this.schedule[i] !== 'Off') {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    // Method to check if the employee can work on a specific day
    canWorkOnDay(day) {
        const consecutiveDays = this.countConsecutiveWorkdays();
        return consecutiveDays < MAX_CONSECUTIVE_SHIFTS_PER_WEEK && this.schedule[day] !== 'Assigned';
    }

    canWork(shift) {
        // Check if the employee can work based on their schedule
        if (this.daysOff > 0) return false;

        // Check consecutive shift rules for agents
        if (this.type === 'agent') {
            if (this.consecutiveShifts >= 5) return false; // Max consecutive shifts
            if (this.consecutiveShifts >= 3 && shift !== 'night') return false; // After 3 shifts, need a day off
            if (this.schedule.length >= 1 && this.schedule[this.schedule.length - 1] === 'night' && shift === 'night') {
                return false; // Two consecutive night shifts
            }
        }

        return true;
    }

    assignShift(shift) {
        this.schedule.push(shift);
        this.consecutiveShifts++;
        this.daysOff = 0; // Reset days off
    }

    takeDayOff() {
        this.daysOff++;
        this.consecutiveShifts = 0; // Reset consecutive shift count
    }
}

// Sample data: Employees and their shift types
const agents = [
    new Employee(1, "Agent A", "agent", []), 
    new Employee(2, "Agent B", "agent", []), 
    new Employee(3, "Agent C", "agent", []), 
    new Employee(4, "Agent D", "agent", []), 
    new Employee(5, "Agent E", "agent", []),
    new Employee(6, "Agent F", "agent", []), 
    new Employee(7, "Agent G", "agent", []), 
    new Employee(8, "Agent H", "agent", []), 
    new Employee(9, "Agent I", "agent", []), 
    new Employee(10, "Agent J", "agent", []), 
    new Employee(11, "Agent K", "agent", []), 
    new Employee(12, "Agent L", "agent", []), 
    new Employee(13, "Agent M", "agent", []), 
    new Employee(14, "Agent N", "agent", [])
];

const managers = [
    new Employee(15, "Manager A", "manager", []),
    new Employee(16, "Manager B", "manager", []),
    new Employee(17, "Manager C", "manager", []),
    new Employee(18, "Manager D", "manager", []),
    new Employee(19, "Manager E", "manager", []),
    new Employee(20, "Manager F", "manager", []),
    new Employee(21, "Manager G", "manager", [])
];

// Function to satisfy constraints
function SATISFY_CONSTRAINTS(employees, day, totalDays) {
    const availableEmployees = [];

    employees.forEach(employee => {
        // Check if the employee can work on the specified day
        if (employee.canWorkOnDay(day)) {
            availableEmployees.push(employee);
        }
    });

    return availableEmployees;
}

/**
 * Shift represents a scheduled period of work
 */
class Shift {
    // #id;
    // #name;
    // #code;
    // #start;
    // #end;
    // #duration;

    constructor(id, name, code, start, end) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.start = start;
        this.end = end;

        this.duration = Math.abs(differenceInHours(
            new Date(new Date().toLocaleDateString()+" "+end),
            new Date(new Date().toLocaleDateString()+" "+start)
        ))
    }

    // get name() {
    //     return this.#name;
    // }

    // set name(value) {
    //     this.#name = value;
    // }

    // get code() {
    //     return this.#code;
    // }

    // set code(value) {
    //     this.#code = value;
    // }

    // get start() {
    //     return this.#start;
    // }

    // set start(value) {
    //     this.#start = value;
    // }

    // get end() {
    //     return this.#end;
    // }

    // set end(value) {
    //     this.#end = value;
    // }

    // get duration() {
    //     return this.#duration;
    // }

    // set duration(value) {
    //     this.#duration = value;
    // }
}

const shifts = [
    new Shift(1, "AM", '6am', "06:00:00", "14:00:00"),
    new Shift(2, "AM", '8am', "08:00:00", "17:00:00"),
    new Shift(3, "PM", '2pm', "14:00:00", "23:00:00"),
    new Shift(4, "NS", '11pm', "23:00:00", "06:00:00"),
    new Shift(5, "OF", 'Day Off', "00:00:00", "23:59:00"),
    // { id: 1, name: 'AM', code: '6am', duration: 8 }, // Shift 1
    // { id: 2, name: 'AM', code: '8am', duration: 8 }, // Shift 2
    // { id: 3, name: 'PM', code: '2pm', duration: 8 }, // Shift 3
    // { id: 4, name: 'NS', code: '11pm', duration: 8 }, // Shift 4
    // { id: 5, name: 'OF', code: 'Day Off', duration: 24 }, // Shift 5
]

/**
 * Schedule is the collection of shifts
 * It covers whole week
 */
class Schedule {
    shifts = [];
    selectedDate;
    // const schedule = new Array(shifts.length).fill(null);

    constructor(date, start, end) {
        this.shifts = [];
        this.selectedDate = date;
        this.start = start;
        this.end = end;
    }

    addShift(shift) {
        this.shifts.push(shift)
    }

    removeShift(shift) {
        this.shifts[this.shifts.indexOf(shift)]
    }

    shuffleShift() {
        shuffle(this.shifts)
    }

    /**
     * Optimizes the shift schedules
     */
    optimize() {
        for (let i in this.shifts) {
            let res = this.shifts[i];
        }
    }

    populateShifts() {
        // Create a 3D array (matrix)
        this.shifts = Array.from({ length: numEmployees }, () =>
            Array.from({ length: numDays }, () =>
                Array(numShifts).fill(0) // Initialize with 0 (no shift assigned)
            )
        );
    }

    toString() {
        this.shifts.map((shift) => {
            console.log(shift);
            return shift
        })
    }
}

/**
 * Roster is the collection of schedules
 * It covers whole month
 */
class Roster {
    #schedules = [];

    constructor(schedules) {
        if (!schedules) throw Error("Schedule param is required")
        this.#schedules = schedules;
    }

    getSchedule(index) {
        return this.#schedules[index] ?? [];
    }

    addSchedule(schedule) {
        this.#schedules.push(schedule)
    }

    displaySchedules() {
        for (let i = 0; i < this.#schedules.length; i++) {
            let schedule = this.#schedules[i];
            console.log(schedule.shifts)
        }
    }
}

// d = new Roster()
// console.log(d.getSchedule(0))

/**
 * Main function, coordinates the process of creating a schedule
 * @returns
 */
function generateSchedule() {
    let range,
        failedShifts = [];

    const numEmployees = 100;
    const numDays = 7;
    const numShifts = 5;

    let shift1 = new Shift(1, "AM", "06:00:00", "14:00:00");
    let shift2 = new Shift(2, "AM", "08:00:00", "17:00:00");
    let shift3 = new Shift(3, "PM", "14:00:00", "23:00:00");
    let shift4 = new Shift(4, "NS", "23:00:00", "06:00:00");
    let shift5 = new Shift(5, "OF", "00:00:00", "23:59:00");

    let schedules = new Schedule(new Date(2024, 10, 17));
    schedules.addShift(shift1);
    schedules.addShift(shift2);
    schedules.addShift(shift3);
    schedules.addShift(shift4);
    schedules.addShift(shift5);
    range = [0, 1];

    // Create a 3D array (matrix)
    let shifts = Array.from({ length: numEmployees }, () =>
        Array.from({ length: numDays }, () =>
            Array(numShifts).fill(0) // Initialize with 0 (no shift assigned)
        )
    );

    /**
     * - rows - employees
     * - columns - days
     * - depth - shifts {AM=1, AM=2, PM=3, NS=4, OF=5}
     * @param {*} employeeIndex
     * @param {*} dayIndex
     * @param {*} shiftIndex
     */
    function assignShift(employeeIndex, dayIndex, shiftIndex) {
        if (shifts[employeeIndex][dayIndex][shiftIndex] === 0) {
            shifts[employeeIndex][dayIndex][shiftIndex] = 1; // Assign shift
            console.log(`Assigned Shift ${shiftIndex} to Employee ${employeeIndex} on Day ${dayIndex}`);
        } else {
            console.log(`Shift ${shiftIndex} already assigned to Employee ${employeeIndex} on Day ${dayIndex}`);
        }
    }

    function assignedShiftFairly(employeeIndex, dayIndex, shiftIndex) {
        const totalShifts = numDays * numShifts;
        const assignedShifts = shifts.flat().filter(shift => shift === 1).length;
        const minShiftsPerEmployee = Math.floor(totalShifts / numEmployees);
        const maxShiftsPerEmployee = Math.ceil(totalShifts / numEmployees);

        // Check if the employee has already reached their maximum shifts
        const currentShifts = shifts[employeeIndex].flat().filter(shift => shift === 1).length;

        if (currentShifts < maxShiftsPerEmployee) {
            shifts[employeeIndex][dayIndex][shiftIndex] = 1; // Assign shift
            console.log(`Assigned Shift ${shiftIndex} to Employee ${employeeIndex} on Day ${dayIndex}`);
        } else {
            console.log(`Employee ${employeeIndex} has reached their maximum shifts.`);
        }
    }

    function checkOverlaps() {
        for (let emp = 0; emp < numEmployees; emp++) {
            for (let day = 0; day < numDays; day++) {
                let assignedShifts = [];
                for (let shift = 0; shift < numShifts; shift++) {
                    if (shifts[emp][day][shift] === 1) {
                        assignedShifts.push(shift);
                    }
                }
                if (assignedShifts.length > MAX_CONSECUTIVE_SHIFTS_PER_WEEK) {
                    console.log(`Employee ${emp} has overlapping shifts on Day ${day}: ${assignedShifts}`);
                }
            }
        }
    }

    function checkConstraints() {
        for (let emp = 0; emp < numEmployees; emp++) {
            let totalShifts = 0;
            for (let day = 0; day < numDays; day++) {
                for (let shift = 0; shift < numShifts; shift++) {
                    if (shifts[emp][day][shift] === 1) {
                        totalShifts++;

                        // if (totalShifts > MAX_CONSECUTIVE_SHIFTS_PER_WEEK) shifts[emp][day][shift] = 0
                    }
                }
            }
            if (totalShifts > MAX_CONSECUTIVE_SHIFTS_PER_WEEK) {
                console.log(`Employee ${emp} exceeds maximum shifts`);
            }
        }
    }

    function displayShifts() {
        console.log(`| empID | day | shift |`);
        for (let emp = 0; emp < numEmployees; emp++) {
            for (let day = 0; day < numDays; day++) {
                for (let shift = 0; shift < numShifts; shift++) {
                    if (shifts[emp][day][shift] === 1) {
                        console.log(`|${emp}|${day}|${shift}|`);
                    }
                }
            }
        }
    }

    for (let empIndex = numEmployees - 1; empIndex >= 0; empIndex--) {
        for (let dayIndex = numDays - 1; dayIndex >= 0; dayIndex--) {
            for (let shiftIndex = numShifts - 1; shiftIndex >= 0; shiftIndex--) {
                assignedShiftFairly(empIndex, dayIndex, shiftIndex)
            }
        }
    }

    checkOverlaps()
    checkConstraints()
    // displayShifts()

    // console.log(shifts)

    return {
        scheduledShifts: schedules.toString(),
        failedShifts,
        success: failedShifts.length === 0,
        start: range[0],
        end: range[1]
    }
}

const _generateSchedule = generateSchedule;
export { _generateSchedule as generateSchedule };

// console.log(generateSchedule())

function* findSumTriplesXGTY() {
    for (let i = 0; i < 999997; i++) {
        yield [i + 2, 1, i + 3];
    }
}

// let d = findSumTriplesXGTY()
// console.log(d.next())
// console.log(d.next())
// console.log(d.next())

const _Shift = Shift;
export { _Shift as Shift };
const _Schedule = Schedule;
export { _Schedule as Schedule };
const _Roster = Roster;
export { _Roster as Roster };




// Backtracking function to assign shifts
function scheduleEmployees2(employees, shiftTypes) {
    // let schedule = {};
    const schedule = new Array(shiftTypes.length).fill(null); // Initialize schedule

    function canAssign(employee, shiftId) {
        return employee.available.includes(shiftId);
    }

    // function backtrack(day = 1) {
    //     if (day === totalDays) {
    //         return true; // All days scheduled successfully
    //     }

    //     for (let i = 0; i < employees.length; i++) {
    //         const employee = employees[i];

    //         for (let shiftType of shiftTypes) {
    //             // Check if the employee can work this shift type on the current day
    //             if (canAssign(employee, shiftType.id)) {
    //                 // if (canAssignShift(employee, day, shiftType.name)) {
    //                 // Assign the shift
    //                 let date = formatDate(new Date().setDate(day), 'yyyy-MM-dd');
    //                 employee.shifts.push({date, type: shiftType});
    //                 schedules[day] = {employee: employee.name, type: shiftType};

    //                 // Recursively attempt to assign the next day
    //                 if (backtrack(day + 1)) {
    //                     return true; // If successful, return true
    //                 }

    //                 // If assignment didn't work out, backtrack
    //                 employee.shifts.pop();
    //                 schedules[day] = null;
    //             }
    //         }
    //     }

    //     return false; // No valid assignment found for this path
    // }

    function backtrack(shiftIndex) {
        if (shiftIndex === shifts.length) {
            return true; // All shifts assigned successfully
        }

        for (let i = 0; i < employees.length; i++) {
            const employee = employees[i];

            if (canAssign(employee, shiftIndex)) {
                schedule[shiftIndex] = employee.name; // Assign employee to shift

                // Recursively attempt to assign next shift
                if (backtrack(shiftIndex + 1)) {
                    return true;
                }

                // If assignment didn't work out, backtrack
                schedule[shiftIndex] = null;
            }
        }

        return false; // No valid assignment found for this path
    }

    // Run the scheduling algorithm
    if (backtrack(1)) {
        console.log('Scheduled Shifts:', schedule);
        // console.log('Employee: ', employees[0].shifts)
        return schedule;
    } else {
        return 'No valid schedule found';
    }
}

// const result = scheduleEmployees(employees, shifts);
// console.log('Scheduled Employees:', result);
// scheduleEmployees2(employees, shifts)

function _2IC_shift_balancer(employees, shifts, day) {
    let schedule = {};

    for (let i = 0; i < employees.length; i++) {
        let employee = employees[i];

        employees.shift();

        for (let j = 0; j < shifts.length; j++) {
            let d = shifts[j];
        }
    }
}


/**
 * Generate a 5-on, 2-off schedule
 * @param {*} daysInMonth 
 * @param {*} startWorkAt 
 * @param {*} daysOn - e.i. 5 days on, 2 days on
 * @param {*} daysOff - 2 days off, e.i. 1 day off
 * @returns 
 */
function generateWorkPattern(daysInMonth, startWorkAt, daysOn = 5, daysOff = 2) {
    if (daysOn == 5 && daysOff !== 2 || daysOn !== 5 && daysOff == 2) throw Error("Please specify the correct work-dayoff pattern e.i. 5-on, 2-off")
    if (daysOn == 3 && daysOff !== 1 || daysOn !== 3 && daysOff == 1) throw Error("Please specify the correct work-dayoff pattern e.i. 3-on, 1-off")
    const pattern = [];
    let workDays = 0;
    let offDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        // if (day >= startWorkAt) {
            if (workDays < daysOn) {
                pattern.push("Work");
                workDays++;
            }
            else if (offDays < daysOff) {
                pattern.push("Off");
                offDays++;
                if (offDays === daysOff) {
                    workDays = 0;
                    offDays = 0;
                }
            }
        // }
        // else {
        //     pattern.push("Off");
        //     offDays++;
        // }
    }

    return pattern;
}

function assignDatesToWorkPattern(workPattern, dateRanges) {
    if (workPattern.length < 0) {
        return []
    }
    let schedule = [];

    workPattern.forEach((pattern, day) => {
        schedule.push({ date: dateRanges[day], shift: pattern });
    });

    return schedule;
}

/**
 * assign shifts to work pattern
 * @param {*} workPatternWithDates 
 * @returns 
 */
function assignShifts2(workPatternWithDates) {
    if (workPatternWithDates.length < 0) {
        return []
    }
    let schedule = [];

    workPatternWithDates.forEach((pattern, day) => {
        let sft = pattern.shift;

        schedule.push({
            date: pattern.date,
            shift: sft
        });
    });

    return schedule;
}

function scheduleEmployees(employees, shifts) {

    function canAssign(employee, shiftId) {
        return employee.available.includes(shiftId);
    }

    function backtrack(shiftIndex) {
        if (shiftIndex === shifts.length) {
            return true; // All shifts assigned successfully
        }

        for (let i = 0; i < employees.length; i++) {
            const employee = employees[i];

            if (canAssign(employee, shiftIndex)) {
                schedule[shiftIndex] = employee.name; // Assign employee to shift

                // Recursively attempt to assign next shift
                if (backtrack(shiftIndex + 1)) {
                    return true;
                }

                // If assignment didn't work out, backtrack
                schedule[shiftIndex] = null;
            }
        }

        return false; // No valid assignment found for this path
    }

    if (backtrack(1)) {
        return schedule;
    } else {
        return 'No valid schedule found';
    }
}

let startDate = "2024/11/01";
let endDate = "2024/11/30";
const dateRanges = DatesWithinRange(startDate, endDate);
let pattern = generateWorkPattern(dateRanges.length, 1, 5, 2);
let workPatternWithDates = assignDatesToWorkPattern(pattern, dateRanges);
let shiftSchedule = assignShifts2(workPatternWithDates);
// let staffSchedules = assignStaffToSchedule(employees, )
// console.log(shiftSchedule);
const _shiftSchedule = shiftSchedule;
export { _shiftSchedule as shiftSchedule };

/**
 * This function tries to balance the shifts of an agent based on the following patterns;
 * - after every 5 days shift, agent can take leave for 2 days
 * - Shift Pattern
 * - 5 days shift, 2 days off
 *
 * Once the agent is assigned to a shift for a day, remove it from the available_agents list


 // count agents shifts
 shifts_count++

 // count agents night shifts
 night_shift_count++

 // count agents day offs
 dayoff_count++

 // if agent takes 2 days off, put agent back into shift
 if day_count > 2
 start working

 // if agent works 2 consec NS, put agent off for 2 days
 if night_shift_count >= 4 AND is_consecutive_night_shift, then
 currentShift = 5

 // if agent works 5 straight days, then is consecutive shifts
 if shift_count >= 5 then
 is_consecutive_shifts = true

 // if agent works 5 consec Shift, put agent off for 2 days
 if is_consecutive_shifts, then
 dayoff_count++;
 if prevDay == dayOff AND curDay = dayOff, then
 nextDay == new Shift



 */
async function balanceAgentShifts(shifts) {
    if (!Array.isArray(shifts)) {
        throw new Error('Shifts are required and must be passed in as an array');
    }

    const TSHIFTS_2 = Object.freeze({
        'Morning': 1,
        'Midday': 2,
        'Afternoon': 3,
        'Night': 4,
        'DayOff': 5
    });

    const TSHIFTS = Object.freeze({
        1: 'AM',
        2: 'AM',
        3: 'PM',
        4: 'NS',
        5: 'DF'
    });

    // let consecutive_shifts_count = {
    //     'AM': 0,
    //     'PM': 0,
    //     'NS': 0,
    //     'DF': 0
    // }

    // let shifts_count = {
    //     'AM': 0,
    //     'PM': 0,
    //     'NS': 0,
    //     'DF': 0,

    //     get(shiftId) {
    //         return TSHIFTS[shiftId];
    //     }
    // };

    const MAX_SHIFT_PER_WEEK = 5;
    const MAX_CONSECUTIVE_NIGHT_SHIFT_PER_WEEK = 2;
    const MAX_CONSECUTIVE_DAYOFF_PER_WEEK = 2;

    let shiftsInWeeks = groupByWeek(shifts);
    const totalShiftsInWeeks = shiftsInWeeks.length;

    // run through weeks
    for (let week = 0; week < totalShiftsInWeeks; week++) {
        let weeklyShifts = shiftsInWeeks[week];
        let weeklyShiftsTotal = weeklyShifts.length;
        let shifts_count = 1; // count all shifts including day offs
        let day_shifts_count = 0; // count only day shifts
        let night_shifts_count = 0; // count only night shifts
        let is_consecutive_night_shift = false;

        let dayoff_count = 0; // count only day offs
        let is_consecutive_day_off = false;
        let is_on_leave = false;

        // take leaves into consideration

        // run through daily shifts
        for (let day = 1; day < weeklyShiftsTotal; day++) {
            let prevShift = weeklyShifts[day-1];
            let currentShift = weeklyShifts[day];

            console.log('current shift: ', currentShift);

            // if agent is on leave, then skip 
            if (is_on_leave) {
                currentShift.shift = 0; // day off
                // break;
            }
            else {
                // if agent was working 5 consecutive shifts, then put agent off for 2 days
                if (shifts_count > MAX_SHIFT_PER_WEEK) {
                    currentShift.shift = 5;
                }

                // if agent was working 2 consecutive night shifts, then put agent off for 2 days
                if (
                    (night_shifts_count >= MAX_CONSECUTIVE_NIGHT_SHIFT_PER_WEEK) &&
                    is_consecutive_night_shift
                ) {
                    currentShift.shift = 5;
                }

                // if agent is taking 2 consecutive day off, then put agent back to shift
                if (
                    (dayoff_count > MAX_CONSECUTIVE_DAYOFF_PER_WEEK) &&
                    is_consecutive_day_off
                ) {
                    currentShift.shift = 1;
                }

                // count consecutive night shifts
                if (currentShift.shift === 4) {
                    night_shifts_count++;

                    // if prevShift is also night shift then agent is working 2 consecutive night shift
                    if (prevShift.shift === 4) {
                        is_consecutive_night_shift = true;
                        // give2DaysOff(weeklyShifts, day, day+1)
                    }
                }

                // count consecutive dayoff
                if (currentShift.shift === 5) {
                    dayoff_count++;

                    // reset count
                    // night_shifts_count = 0;
                    // shifts_count = 0;
                    // day_shifts_count = 0;

                    if (prevShift.shift === 5) {
                        is_consecutive_day_off = true;
                        // give2DaysOff(weeklyShifts, day, day+1)
                    }
                }

                // count the number of shifts agent is working
                shifts_count++;
            }
        }

        // console.log(weeklyShifts)
        console.log("------------- reset -------------")
        console.log('consec night shift count: ', night_shifts_count)
        console.log('shifts count: ', shifts_count)
        console.log("------------- reset -------------")
    }

    // console.log(shiftsInWeeks)

    return shiftsInWeeks.flat();
}

function give2DaysOff(weeklyShifts, currentDay, nextDay) {
    console.log("2 days off")
    weeklyShifts[currentDay % weeklyShifts.length].shift = 5;
    weeklyShifts[nextDay % weeklyShifts.length].shift = 5;
}

const _balanceAgentShifts = balanceAgentShifts;
export { _balanceAgentShifts as balanceAgentShifts };

function checkAvailableShifts(employeeId) {
    employee.findById(employeeId).then((res) => {
        // console.log(employee)

        // if employee is on leave, then employee is not available for any shifts
        // if (employee) {

        // }
        // get all shifts for employee
        // else {
        // }
    })
}

/**
 * Check if the agents is eligible for day for current day
 *
 * @param {*} currentSchedule - current week schedule
 * @param {*} currentShift - current shift
 */
function isEligibleForDayOff(currentSchedule, currentShift) {
}

/**
 * check if agent has worked 2 night shifts
 * @param {*} currentSchedule - current weekly shifts
 * @param {*} currentShift - current day shift
 * @return {boolean} - true
 */
function hasWorked2Nights(currentSchedule, currentShift) {
    let n = currentSchedule.length;

    // iterate through current week and check if agent's previous shift was night shift
    for (let i = 0; i < n; i++) {
        if (currentSchedule[i] == currentShift) {

        }
    }
}

function satisfy_constraint(employees, max, min, day, D) {
    let available_e = [];
    let days = [1,2,3,4,5,6,7]

    for (let employee of employees) {
        // get all employees that are not on 'day off' and are not taking 'leaves'
        if (employee.isOnLeave) {
            continue;
        }
        else {
            if (employee.shift.shif_name === 'off') {
                available_e.push(employee)
            }
        }
    }

    for (let day of days) {
        for (let employee of employees) {
            let g = search()
        }
    }

    return e;
}

/**
 * 
 * @param {*} work_period 
 * @param {*} available_E 
 * @returns 
 */
function estimate_number(work_period, available_E) {
    return undefined;
}

/**
 * 
 * @param {*} work_period 
 * @param {*} people_sft_t 
 * @returns 
 */
function search_assignment(work_period, people_sft_t) {
    return undefined;
}

/**
 * 
 * @param {*} fa - feasible assignment
 * @returns fs - feasible schedule
 */
function decide_flextime(available_E, ap, fa) {
    let fs = [];

    let matrix_fa = fa;
    let avg_fs = 10; // compute average proficiency for fs

    for (let d in fa) {
        let coverage = calculateCoverage(); // compute coverage of each time period for d
        let E_sft = getEmployees(sft_t);
        let sorted_sft = sortBy();

        for (let sft_t in SFT) {
            for (let tp in [1,2,3,4,5,6]) {
                if (coverage >= avg_fs) {
                    for (let e_sft in E_sft) {
                        e_sft = "rest";
                    }
                }
            }

            for (let tp in [1, 30]) {
                if (coverage >= avg_fs) {
                    for (let e_sft in E_sft) {
                        e_sft = "rest";
                    }
                }
            }
        }
        fs.push(E_sft);
    }

    return fs; 
}

function fs_schedule(employees, day_range, work_period, max, min) {
    let fs = [];
    let fa;

    for (let day in day_range) {
        let available_E = satisfy_constraint(employees, max, min, day);
        let people_sft_t = estimate_number(work_period, available_E);
        fa = search_assignment(work_period, people_sft_t);
    }

    fs = decide_flextime(fa);

    return fs;
}

// Sample DCT for 7-day scheduling horizon
const DCT = [
    { id: 1, days: "work|work|work|work|work|rest|rest" },
    { id: 2, days: "work|work|rest|work|work|work|rest" },
    // { id: 3, days: "work|rest|work|rest|work|work|rest" },
    { id: 3, days: "work|work|work|rest|work|work|rest" },
    // { id: 5, days: "work|work|work|work|rest|work|rest" },
    // { id: 6, days: "rest|work|work|work|work|work|rest" },
    // { id: 7, days: "work|work|rest|work|work|rest|work" },
    // { id: 8, days: "work|rest|work|work|rest|work|rest" }
];

/**
 * Function to check if a given schedule matches any valid sequence in the DCT
 * @param {Array} proposedSchedule - Array of "Work"/"Rest" values for each day (e.g., ["Work", "Work", "Rest", ...])
 * @returns {Object|null} - Returns the matching DCT sequence or null if no match found
 */
function isValidSchedule2(proposedSchedule) {
    if (Array.isArray(proposedSchedule)) proposedSchedule = proposedSchedule.join('|').toLowerCase();
    
    for (let sequence of DCT) {
        // Check if the proposed schedule matches any sequence in the DCT
        if (sequence.days === proposedSchedule) {
            return sequence;
        }
    }
    return null;
}

// const employeeSchedule = ["Work", "Work", "Work", "Work", "Work", "Rest", "Rest"];
// const result = isValidSchedule2(employeeSchedule);

// if (result) {
//     console.log("Valid schedule found:", result);
// } else {
//     console.log("No matching schedule found in DCT.");
// }

// Function to get recent shifts assigned before the current day
function getRecentShifts(shifts, currentDay) {
    return shifts.slice(Math.max(0, currentDay - 7), currentDay); // Look back at the last week
}

function getShiftType(day) {
    return day % 2 === 0 ? 'day' : 'night'
}

function canAssign(employee, shiftId) {
    return employee.available.includes(shiftId);
}

// Function to determine if an employee can be assigned a shift on a given day
// Function to check if an employee can be assigned a shift based on constraints
function canAssignShift(employee, day, shiftType) {
    const recentShifts = getRecentShifts(employee.shifts, day);

    // Check for consecutive day shifts
    const consecutiveDays = recentShifts.filter(shift => shift.type.name === 'AM' || shift.type.name === 'PM' || shift.type.name === 'NS').length;
    const consecutiveNights = recentShifts.filter(shift => shift.type.name === 'NS').length;

    // Check constraints
    if (consecutiveDays >= MAX_CONSECUTIVE_SHIFTS_PER_WEEK || consecutiveNights >= MAX_CONSECUTIVE_NIGHT_SHIFTS_PER_WEEK) {
        return false;
    }

    // Check for required days off after reaching maximum limits
    // if ((consecutiveDays === MAX_CONSECUTIVE_SHIFTS_PER_WEEK && day + 1 < totalDays && !shifts[day + 1]) ||
    //     (consecutiveNights === MAX_CONSECUTIVE_NIGHT_SHIFTS_PER_WEEK && day + 1 < totalDays && !shifts[day + 1])) {
    //     return false;
    // }

    // Check constraints
    // if (consecutiveDays >= 5 && (shiftType === 'AM' || shiftType === 'PM')) return false; // Limit for day shifts
    // if (consecutiveNights >= 2 && shiftType === 'NS') return false; // Limit for night shifts

    return true; // Employee can be assigned to this shift
}

function balanceSchedules(schedules) {
    const SHIFTS = [1,2,3,4,5];

    let PERFECT_SHIFTS = [
        [1,2,3,4,5,5,2],
        [1,1,1,1,1,0,0],
        [1,0,0,0,0,0,0]
    ];
    const PERFECT_SHIFTS_LENGTH = PERFECT_SHIFTS.length;

    for (let i = 0; i < PERFECT_SHIFTS_LENGTH; i++) {
        const currentShift = PERFECT_SHIFTS[i];

        // if (squares[currentShift.shift]) {}

        // if () {

        // }
    }

    function backtrack(index, currentSchedule, allSchedules, shifts) {
        if (index === shifts.length) {
            allSchedules.push([...currentSchedule]);
            return;
        }

        for (let shift of shifts) {
            // check if the shift is not a day off
            if (shift.shift !== 5) {
                currentSchedule.push(shift);
                backtrack(index + 1, currentSchedule, allSchedules, shifts);
                currentSchedule.pop();
            }
        }
    }

    function generateSchedules(shifts) {
        const allSchedules = [];
        backtrack(0, [], allSchedules, shifts);
        return allSchedules;
    }

    const shifts = [
        [1, 2, 3, 4, 5, 5, 2],
        [1, 1, 1, 1, 1, 0, 0],
        [1, 2, 3, 4, 5, 5, 2],
    ];

    shifts.forEach((row, index) => {
        let validSchedules = generateSchedules(row);
        console.log(`Combinations for row ${index + 1}:`, validSchedules.slice(0, 5));
    })
}

// balanceSchedules([]);
// generateSchedule()

function fishesYatesShuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function solveAgentSchedulingProblem() {
    let res = [];
    let weeklyShifts = [1,2,3,4,5,6];
    let allShifts = [1,2,3,9,10,11,12,13,14,15];
    // let used = new Array(nums.length).fill(false);

    myBacktrack(0, weeklyShifts, allShifts, []);
    return weeklyShifts;
}

// let s = solveAgentSchedulingProblem()
// console.log(s)

/**
 *
 * @param {*} index - shift index
 * @param {*} currentSchedule - current weekly schedule
 * @param {*} allSchedules - current monthly schedule
 * @param {*} shifts - shifts types
 * @returns
 */
function myBacktrack(index, currentSchedule, allSchedules, shifts) {
    if (currentSchedule === allSchedules.length) {
        allSchedules.push([...currentSchedule])
        return;
    }

    // 
    let n = allSchedules.length;
    for (let col = 0; col < n; col++) {
        // exclude illegal choices
        // if (!isValid1(allSchedules, currentSchedule, col)) {
        //     continue;
        // }

        // make a choice
        currentSchedule.push(allSchedules[col]);

        // move to the next row decision
        myBacktrack(index + 1, currentSchedule, allSchedules[col], shifts);

        // undo the choice
        currentSchedule.pop();
    }
}

let myBacktrackResult = []
function myBacktrack2(schedule, shifts_list) {
    if (shifts_list.length === schedule.length) {
        myBacktrackResult.push(schedule)
        return true;
    }

    for (let shift in shifts_list) {
        schedule.push(shift)
        myBacktrack2(schedule, shifts_list)
        schedule.pop()
    }
}

// myBacktrack2([], shifts)
// console.log(myBacktrackResult)


const generateShiftSchedule = (employees, daysInMonth) => {
    const shifts = ['Morning', 'Afternoon', 'Night'];
    const schedule = {};

    // Initialize employee shifts
    for (let employee of employees) {
        schedule[employee] = {
            Morning: 0,
            Afternoon: 0,
            Night: 0,
            daysOffAfterMidnight: 0,
        };

        // Iterate through the days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            for (const shift of shifts) {
                let assigned = 0;

                // Assign a shift to employees
                for (let employee of employees) {
                    if (schedule[employee][shift] < Math.floor(daysInMonth / shifts.length)) {
                        schedule[employee][shift]++;
                        assigned++;
                    }

                    if (assigned === employees.length) {
                        break;
                    }
                }

                // Handle days off after Midnight shift
                if (shift === 'Night') {
                    for (let employee of employees) {
                        if (schedule[employee].daysOffAfterMidnight < 2) {
                            schedule[employee].daysOffAfterMidnight++;
                            break;
                        }
                    }
                }
            }
        }

        return schedule;
    }

    // to do ()
    const printDaysInIntervals = (dateArray) => {
        const twoDayInterval = [];
        const threeDayInterval = [];
        const result = {};

        for (let i = 0; i < dateArray.length; i++) {
            if (i % 2 === 0) {
                if (!twoDayInterval.includes(dateArray[i])) {
                    twoDayInterval.push(dateArray[i]);
                }
            }
            if (i % 3 === 0) {
                if (!threeDayInterval.includes(dateArray[i]) && !twoDayInterval.includes(dateArray[i])) {
                    threeDayInterval.push(dateArray[i]);
                }
            }
        }

        // Assign flags to the dates
        twoDayInterval.forEach((date, index) => {
            result[date] = "AM";
            if (index % 3 === 1) {
                result[date] += ",PM";
            }
            if (index % 3 === 2) {
                result[date] += ", NS";
            }
        });

        threeDayInterval.forEach((date, index) => {
            if (!result[date]) {
                result[date] = "AM";
            }
            if (index % 3 === 1) {
                result[date] += ", PM";
            }
            if (index % 3 === 2) {
                result[date] += ", NS";
            }
        });
    }
}

function calcSubset(A, res, subset, index) {
    if (index === res.length) {
        // Add the current subset to the result list
        res.push([...subset]);
        return;
    }

    // Generate subsets by recursively including and excluding elements
    for (let i = index; i < A.length; i++) {
        // Include the current element in the subset
        subset.push(A[i]);

        // Recursively generate subsets with the current element included
        calcSubset(A, res, subset, i + 1);

        // Exclude the current element from the subset (backtracking)
        subset.pop();
    }
}

function subsets(A) {
    const subset = [];
    const res = [];
    let index = 0;

    calcSubset(A, res, subset, index);

    return res;
}

// Driver code
function main() {
    const array = [1, 2, 3, 4, 5];
    const res = subsets(array);

    // Print the generated subsets
    for (let i = 0; i < res.length; i++) {
        console.log('{'+res[i].join(', ')+'}');
    }
}
// main();



function isValidSchedule(schedule) {
    const agentCount = schedule.filter(emp => emp.type === 'agent').length;
    const managerCount = schedule.filter(emp => emp.type === 'manager').length;
    
    return agentCount === 9 && managerCount === 2;
}

function scheduleShifts(day, currentSchedule) {
    if (day === totalDays) {
        console.log("Final Schedule: ", currentSchedule);
        return true; // Successfully scheduled all days
    }

    for (let shift of shifts) {
        const tempSchedule = [];
        
        for (let emp of currentSchedule) {
            if (emp.canWork(shift.code)) {
                emp.assignShift(shift.code);
                tempSchedule.push(emp);
            } else {
                emp.takeDayOff();
                tempSchedule.push(emp);
            }
        }

        if (isValidSchedule(tempSchedule)) {
            if (scheduleShifts(day + 1, tempSchedule)) {
                return true; // Proceed to the next day
            }
        }

        // Backtrack: Reset assignments
        for (let emp of tempSchedule) {
            emp.schedule.pop(); // Remove last assigned shift
            emp.daysOff > 0 ? emp.takeDayOff() : emp.consecutiveShifts--; // Adjust days off or consecutive count
        }
    }

    console.log("No valid schedule: ", currentSchedule)
    return false;
}

// Start scheduling from day 0 with an empty schedule
// scheduleShifts(0, [...agents, ...managers]);





/**
 * Scheduling Horizon (`D`) - Create an array representing each day within the scheduling period.
 */
const schedulingHorizon = Array.from({ length: totalDays }, (_, i) => i + 1);
const employees2 = Array.from({ length: 100 }, (_, i) => new Employee(i + 1, "Employee "+(i+1), "agent", []));

const workload = [
    { timePeriod: 8, requiredProficiency: 35 },
    { timePeriod: 9, requiredProficiency: 30 },
]

/**
 * calculate how evenly workload distribution is across shifts
 * @param {*} workload 
 * @param {*} employees 
 * @returns coverage
 */
// function calculateCoverage(workload, employees) {
//     let totalProficiency = employees.reduce((sum, emp) => sum + emp.proficiency, 0);
//     let coverage = workload / totalProficiency;
//     return coverage;
// }
function calculateCoverage(workload, assignedProficiency) {
    return workload.map(period => {
        const assigned = assignedProficiency[period.timePeriod] || 0;
        return {
            timePeriod: period.timePeriod,
            coverage: assigned / period.requiredProficiency
        };
    });
}


/**
 * Rest Days: Add constraints for required rest days within the schedule.
 * @param {*} employee 
 * @param {*} daysWorked 
 * @param {*} maxDays - Ensure each employee works a minimum and maximum number of consecutive days.
 * @param {*} minDays - Ensure each employee works a minimum and maximum number of consecutive days.
 */
function assignShifts(employee, daysWorked, maxDays, minDays) {
    if (daysWorked >= minDays && daysWorked <= maxDays) {
        // assign shift and ensure rest days between blocks of workdays
    }
}

/**
 * Adjust start and end times of each employee’s shift based on workload needs.
 * @param {*} employee 
 * @param {*} shift 
 * @param {*} coverage 
 * @param {*} targetCoverage 
 * @returns shift;
 */
function adjustFlexTime(employee, shift, targetCoverage) {
    if (shift.coverage > targetCoverage) {
        // Adjust start/end times to reduce coverage
        // Start later or end earlier if overstaffed
        if (shift.end > shift.start + 1) shift.end -= 1;
    } else {
        // Adjust to increase coverage if needed
        // Extend shift if understaffed
        shift.end += 1;
    }

    return shift;
}

/**
 * Average Proficiency Matrix (PAM): Use pairs of employees to balance proficiency across shifts.
 * @param {*} employees 
 * @returns {*} pairedAssignments
 */
function pairwiseAllocate(employees, shifts) {
    employees.sort((a, b) => a.proficiency - b.proficiency);
    let pairedAssignments = [];

    for (let i = 0; i < employees.length / 2; i++) {
        let pair = [employees[i], employees[employees.length - i - 1]];
        let shift = shifts[i % shifts.length]; // Rotate through shifts
        pairedAssignments.push({
            pair: pair.map(emp => emp.id),
            shift: shift.type
        });
        // pairedAssignments.push([employees[i], employees[employees.length - i - 1]]);

    }
    return pairedAssignments;
}

/**
 * Use a multi-objective scoring system to rate schedules, aiming for the best trade-off between coverage and fairness.
 * @param {*} coverage 
 * @param {*} fairness 
 * @returns 
 */
// function topsisScoring(coverage, fairness) {
//     // Calculate scores and select schedule with highest score
//     let score = 1 / (Math.abs(1 - coverage) + fairness);
//     return score;
// }
function topsisEvaluation(coverageArray) {
    let scores = coverageArray.map(cov => {
        return Math.abs(1 - cov.coverage);
    });
    return scores.reduce((a, b) => a + b) / scores.length;
}

/**
 * Ensure Constraints: Rest Days and Consecutive Working Days
 * @param {*} assignments 
 * @param {*} maxDays 
 * @param {*} minDays 
 * @param {*} restDays 
 * @returns 
 */
function applyConstraints(assignments, maxDays = 5, minDays = 2, restDays = 1) {
    assignments.forEach(assignment => {
        let daysWorked = 0;
        for (let i = 0; i < assignment.length; i++) {
            if (assignment[i].shift) {
                daysWorked++;
                if (daysWorked > maxDays) {
                    assignment[i].shift = null; // Assign rest day
                    daysWorked = 0;
                }
            } else {
                daysWorked = 0;
            }
        }
    });
    return assignments;
}

function generateSchedule2() {
    let schedule = [];
    const shifts = [
        { type: 1, start: 8, end: 16, meal: [12, 13] }, // Shift from 8 AM to 4 PM with lunch at noon
        { type: 2, start: 9, end: 17, meal: [12, 13] },
        { type: 3, start: 10, end: 18, meal: [13, 14] }
    ];
    
    // Employees array: Each employee has an ID and a proficiency score.
    const employees = [
        { id: 1, proficiency: 18, shifts: [] },
        { id: 2, proficiency: 20, shifts: [] },
        { id: 3, proficiency: 15, shifts: [] },
        // Add more employees as needed
    ];
    
    // Target workload for each time period
    const workload = [
        { timePeriod: 8, requiredProficiency: 35 },
        { timePeriod: 9, requiredProficiency: 30 },
        // Define other time periods and their workload requirements
    ];

    for (let day = 0; day < totalDays; day++) {
        let assignments = pairwiseAllocate(employees, shifts);

        assignments.forEach(assignment => {
            assignment.shift = adjustFlexTime(assignment.pair[0], assignment.shift, 1.0); // target coverage
        });

        applyConstraints(assignments);

        // Calculate and evaluate coverage
        let coverageResults = calculateCoverage(workload, assignments);
        let scheduleScore = topsisEvaluation(coverageResults);
        schedule.push({ day, assignments, score: scheduleScore });
    }

    // Select the schedule with the best score
    schedule.sort((a, b) => a.score - b.score);
    return schedule;
}
// let s = generateSchedule2();
// console.log(s);

/**
 * generateManagerSchedule
 * 
 * 2IC and Managers work in pairs per day and 1 in night shift
 */
function generateManagersSchedule() {
    let pattern = [3, 1]

    let workPattern = generateWorkPattern(totalDays, 1, pattern[0], pattern[1]);
    console.log(workPattern);
}
// generateManagersSchedule()



// let schedule = {};
// for (let e of employees) {
//     for (let d of days) {
//         for (let s of shifts) {
//             if (schedule[e][d][s]) {
//                 schedule[e][d][s] = 1;
//             }
//             else {
//                 schedule[e][d][s] = 0;
//             }
//         }
//     }
// }


/*

# Algorithm
1. start
2. let agents = [],
    agent = null,
    isShiftExist = false,
    assignedShifts = [];

3. agents <- pull down agents
4. agent <- loop through each agents
5. isShiftExist <- check if agent has an existing shift for the day
6. if isShiftExist == true
    assignedShifts(agent)
7. else isShiftExist
    assignShift = agent
8. end

# Pseudo-code
agents <- fetchAgents
for each agents do
*/


const existingShiftSchedules = new Map();
existingShiftSchedules.set("2", "3");
existingShiftSchedules.has("2", );
existingShiftSchedules.get("2");

