import { shuffle, sortBy } from 'lodash';
import { formatDistance, differenceInHours, getDaysInMonth, formatDate, format, eachDayOfInterval } from 'date-fns';
import { daysInWeek } from "date-fns/constants";

// Constraints
const MAX_CONSECUTIVE_SHIFTS_PER_WEEK = 5;
const MAX_CONSECUTIVE_NIGHT_SHIFTS_PER_WEEK = 2;
const MAX_CONSECUTIVE_DAYOFF_PER_WEEK = 2;
const EXPECTED_NUM_OF_WORKING_DAYS_PER_WEEK = 7;
const MAX_CONSECUTIVE_LEAVE_PER_WEEK = 2;
const MAX_SHIFT_PER_WEEK = 5;
const SHIFT_PATTERNS = [
    [5, 2], // 5 days work, 2 days off
    [3, 1] // 3 days work, 1 days off
];
const TSHIFTS_2 = Object.freeze({
    'AM': 1,
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

let startDate = "2024/11/01";
let endDate = "2024/11/30";
const totalDays = getDaysInMonth(new Date()); // Total days to schedule
const dateRanges = eachDayOfInterval({start: startDate, end: endDate});

/**
 * Scheduling Horizon (`D`) - Create an array representing each day within the scheduling period.
 */
const schedulingHorizon = Array.from({ length: totalDays }, (_, i) => i + 1);


interface IEmployee {
    id: number;
    name: string;
    isOnLeave: boolean;
    // subgroupId: number;
}

class Employee implements IEmployee {
    id: number;
    name: string;
    isOnLeave: boolean;
    // subgroupId: number;
    availableShifts: IShift[];
    availableDates: string[];
    schedule: Map<string, IShift>;
    
    
    /**
     *
     * @param id
     * @param availableFor - shifts available for this employee
     */
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.availableShifts = [];
        this.isOnLeave = false;
        // this.subgroupId = 1;
        this.schedule = new Map(); // List of assigned shifts
        this.availableDates = []; // dates in the format yyyy-mm-dd
        // this.type = type; // 'agent' or 'manager'
        // this.consecutiveShifts = 0; // Count of consecutive shifts worked
        // this.daysOff = 0; // Count of days off taken
    }

    /**
     * checks if the employee does not have a shift on the given date and given date is not included in his/her available dates
     * @param date 
     * @returns boolean
     */
    isAvailable(date: string) {
        return this.schedule.has(date);
    }

    addShift(date: string, shift: IShift) {
        this.schedule.set(date, shift);
    }

    removeShift(date: string) {
        this.schedule.delete(date);
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
    canWorkOnDay(day: string | number) {
        const consecutiveDays = this.countConsecutiveWorkdays();
        return consecutiveDays < MAX_CONSECUTIVE_SHIFTS_PER_WEEK && this.schedule[day] !== 'Assigned';

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
}


interface IShift {
    id: number;
    start_time: string;
    end_time: string;
    name: string;
    // employees: IEmployee[];
}

/**
 * Shift represents a scheduled period of work
 * Shift capture the whole day
 */
class Shift implements IShift {
    id: number;
    name: string;
    code: string;
    start_time: string; // time period
    end_time: string; // time period
    duration: number;
    // employees: IEmployee[];
    
    constructor(id: number, name: string, code: string, start_time: string, end_time: string) {
        this.id = id;
        this.code = code;
        this.start_time = start_time;
        this.end_time = end_time;
        this.name = name;
        this.name = name;
       
        this.duration = Math.abs(differenceInHours(
            new Date(new Date().toLocaleDateString() + " " + end_time),
            new Date(new Date().toLocaleDateString() + " " + start_time)
        ))
    }
}

interface ISchedule {
    // id: number;
    date: string;
    employee: IEmployee;
    shifts: IShift[];
}

/**
 * Schedule capture the whole week
 * Schedule is the collection of shifts
 * It covers whole week
 */
class Schedule implements ISchedule {
    date: string;
    employee: IEmployee;
    shifts: IShift[];
    // const schedule = new Array(shifts.length).fill(null);

    constructor(date: string, employee: IEmployee, shifts: IShift[]) {
        this.date = date;
        this.employee = employee;
        this.shifts = shifts;
    }

    addShift(shift: IShift) {
        this.shifts.push(shift)
    }

    removeShift(shift: Shift) {
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

let shifts: IShift[] = [
    new Shift(1, "AM", '6am', "06:00:00", "14:00:00"),
    new Shift(2, "AM", '8am', "08:00:00", "17:00:00"),
    new Shift(3, "PM", '2pm', "14:00:00", "23:00:00"),
    new Shift(4, "NS", '11pm', "23:00:00", "06:00:00"),
    new Shift(5, "OF", 'Day Off', "00:00:00", "23:59:00"),
]

let schedules: ISchedule[] = [
    new Schedule(new Date(2024, 10, 28), new Date(2024, 11, 3), "October - November", shifts),
    new Schedule(new Date(2024, 11, 4), new Date(2024, 11, 10), "November 1", shifts),
    new Schedule(new Date(2024, 11, 11), new Date(2024, 11, 18), "November 2", shifts),
    new Schedule(new Date(2024, 11, 18), new Date(2024, 11, 24), "November 3", shifts),
]

// const employees2 = Array.from({ length: 100 }, (_, i) => new Employee(i + 1, "Employee " + (i + 1), "agent", []));
let employees = [
    new Employee(1, "John"),
    new Employee(2, "Jane"),
    new Employee(3, "Maggie"),
    new Employee(4, "Holly"),
    new Employee(5, "Jolly"),
    new Employee(6, "Amy")
]

// Sample data: Employees and their shift types
// const agents = [
//     new Employee(1, "Agent A", "agent", []),
//     new Employee(2, "Agent B", "agent", []),
//     new Employee(3, "Agent C", "agent", []),
//     new Employee(4, "Agent D", "agent", []),
//     new Employee(5, "Agent E", "agent", []),
//     new Employee(6, "Agent F", "agent", []),
//     new Employee(7, "Agent G", "agent", []),
//     new Employee(8, "Agent H", "agent", []),
//     new Employee(9, "Agent I", "agent", []),
//     new Employee(10, "Agent J", "agent", []),
//     new Employee(11, "Agent K", "agent", []),
//     new Employee(12, "Agent L", "agent", []),
//     new Employee(13, "Agent M", "agent", []),
//     new Employee(14, "Agent N", "agent", [])
// ];

// const managers = [
//     new Employee(15, "Manager A", "manager", []),
//     new Employee(16, "Manager B", "manager", []),
//     new Employee(17, "Manager C", "manager", []),
//     new Employee(18, "Manager D", "manager", []),
//     new Employee(19, "Manager E", "manager", []),
//     new Employee(20, "Manager F", "manager", []),
//     new Employee(21, "Manager G", "manager", [])
// ];

// let shift1 = new Shift(1, "AM", "06:00:00", "14:00:00");
// let shift2 = new Shift(2, "AM", "08:00:00", "17:00:00");
// let shift3 = new Shift(3, "PM", "14:00:00", "23:00:00");
// let shift4 = new Shift(4, "NS", "23:00:00", "06:00:00");
// let shift5 = new Shift(5, "OF", "00:00:00", "23:59:00");

// let schedules = new Schedule(new Date(2024, 10, 17));
// schedules.addShift(shift1);
// schedules.addShift(shift2);
// schedules.addShift(shift3);
// schedules.addShift(shift4);
// schedules.addShift(shift5);

/**
 * ShiftScheduler tries to solve the shift scheduling problem
 */
class ShiftScheduler {
    shifts: IShift[];
    schedules: ISchedule[];
    employees: IEmployee[];
    
    workload = [
        { timePeriod: 8, requiredProficiency: 35 },
        { timePeriod: 9, requiredProficiency: 30 },
    ]

    constructor(shifts: IShift[], schedules: ISchedule[]) {
        this.shifts = shifts;
        this.schedules = schedules;
        this.employees = [];

        this._initialize();
    }

    _initialize() {
        // createWorkPattern();
        // calculateCoverage();
    }

    /**
     * Main function, coordinates the process of creating a schedule
     * @returns
     */
    generateSchedules(employees: IEmployee[]) {
        this.employees = employees;
        let size = this.employees.length;
        let shiftsTotal = this.shifts.length;
        let range, failedShifts: string | any[] = [];

        const numEmployees = size;
        const numDays = 7;
        const numShifts = 5;

        range = [0, 1];

        // for each employee
        for (let i = 0; i < size; i++) {
            console.log(this.employees[i])

            // for each shift
            for (let j = 0; j < shiftsTotal; j++) {
                console.log(this.shifts[j])
            }
        }

        // Create a 3D array (matrix)
        let shifts = Array.from({ length: numEmployees }, () =>
            Array.from({ length: numDays }, () =>
                Array(numShifts).fill(0) // Initialize with 0 (no shift assigned)
            )
        );
        
        for (let empIdx = numEmployees - 1; empIdx >= 0; empIdx--) {
            for (let dayIdx = numDays - 1; dayIdx >= 0; dayIdx--) {
                for (let shiftIdx = numShifts - 1; shiftIdx >= 0; shiftIdx--) {
                    this.assignedShiftFairly(empIdx, dayIdx, shiftIdx)
                }
            }
        }

        this.checkOverlaps();
        this.checkConstraints();
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

    /**
     * - rows - employees
     * - columns - days
     * - depth - shifts {AM=1, AM=2, PM=3, NS=4, OF=5}
     * @param {*} employeeIdx
     * @param {*} dayIdx
     * @param {*} shiftIdx
     */
    assignShift(employeeIdx: number, dayIdx: number, shiftIdx: number) {
        if (this.shifts[employeeIdx][dayIdx][shiftIdx] === 0) {
            this.shifts[employeeIdx][dayIdx][shiftIdx] = 1; // Assign shift
            console.log(`Assigned Shift ${shiftIdx} to Employee ${employeeIdx} on Day ${dayIdx}`);
        } else {
            console.log(`Shift ${shiftIdx} already assigned to Employee ${employeeIdx} on Day ${dayIdx}`);
        }
    }

    assignedShiftFairly(employeeIdx: number, dayIdx: number, shiftIdx: number) {
        const totalShifts = numDays * this.numShifts;
        const assignedShifts = this.shifts.flat().filter(shift => shift === 1).length;
        const minShiftsPerEmployee = Math.floor(totalShifts / numEmployees);
        const maxShiftsPerEmployee = Math.ceil(totalShifts / numEmployees);

        // Check if the employee has already reached their maximum shifts
        const currentShifts = shifts[employeeIdx].flat().filter(shift => shift === 1).length;

        if (currentShifts < maxShiftsPerEmployee) {
            shifts[employeeIdx][dayIdx][shiftIdx] = 1; // Assign shift
            console.log(`Assigned Shift ${shiftIdx} to Employee ${employeeIdx} on Day ${dayIdx}`);
        } else {
            console.log(`Employee ${employeeIdx} has reached their maximum shifts.`);
        }
    }
    
    checkOverlaps() {
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
    
    checkConstraints() {
        for (let emp = 0; emp < this.employees.length; emp++) {
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

    displayShifts() {
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
}

let shiftScheduler = new ShiftScheduler(shifts, schedules)
shiftScheduler.generateSchedules(employees);

// Function to satisfy constraints
function SATISFY_CONSTRAINTS(employees: any[], day: any, totalDays: any) {
    const availableEmployees: any[] = [];

    employees.forEach((employee: { canWorkOnDay: (arg0: any) => any; }) => {
        // Check if the employee can work on the specified day
        if (employee.canWorkOnDay(day)) {
            availableEmployees.push(employee);
        }
    });

    return availableEmployees;
}

async function satisfy_constraint(employees: IEmployee[], _max: number, _min: number, day: number, _D: number[]) {
    let available_e = [];
    let days = [1, 2, 3, 4, 5, 6, 7]

    for (const employeesKey of employees) {
        if (employeesKey.id) {
            return day
        }
    }

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


async function estimate_number(timePeriod: any[], availableEmployees: IEmployee[]) {
    return shifts;
}

function search_assignment(timePeriod: never[], people_sft_t: undefined) {
    return 1
}

function decide_flextime(fa: number | undefined) {

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

// Backtracking function to assign shifts
function scheduleEmployees2(employees: string | any[], shiftTypes: string | any[]) {
    // let schedule = {};
    const schedule = new Array(shiftTypes.length).fill(null); // Initialize schedule

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

    function backtrack(shiftIdx: number) {
        if (shiftIdx === shifts.length) {
            return true; // All shifts assigned successfully
        }

        for (let i = 0; i < employees.length; i++) {
            const employee = employees[i];

            if (canAssign(employee, shiftIdx)) {
                schedule[shiftIdx] = employee.name; // Assign employee to shift

                // Recursively attempt to assign next shift
                if (backtrack(shiftIdx + 1)) {
                    return true;
                }

                // If assignment didn't work out, backtrack
                schedule[shiftIdx] = null;
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

function _2IC_shift_balancer(employees: any[], shifts: string | any[], day: any) {
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
function createWorkPattern(daysInMonth: number, startWorkAt: number, daysOn = 5, daysOff = 2) {
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

function assignDatesToWorkPattern(workPattern: any[], dateRanges: { [x: string]: any; }) {
    if (workPattern.length < 0) {
        return []
    }
    let schedule: { date: any; shift: any; }[] = [];

    workPattern.forEach((pattern: any, day: string | number) => {
        schedule.push({ date: dateRanges[day], shift: pattern });
    });

    return schedule;
}

/**
 * assign shifts to work pattern
 * @param {*} workPatternWithDates 
 * @returns 
 */
function assignShifts2(workPatternWithDates: any[]) {
    if (workPatternWithDates.length < 0) {
        return []
    }
    let schedule: { date: any; shift: any; }[] = [];

    workPatternWithDates.forEach((pattern: { shift: any; date: any; }, day: any) => {
        let sft = pattern.shift;

        schedule.push({
            date: pattern.date,
            shift: sft
        });
    });

    return schedule;
}

function scheduleEmployees(employees: string | any[], shifts: string | any[]) {

    function canAssign(employee: { available: string | any[]; }, shiftId: any) {
        return employee.available.includes(shiftId);
    }

    function backtrack(shiftIdx: number) {
        if (shiftIdx === shifts.length) {
            return true; // All shifts assigned successfully
        }

        for (let i = 0; i < employees.length; i++) {
            const employee = employees[i];

            if (canAssign(employee, shiftIdx)) {
                schedule[shiftIdx] = employee.name; // Assign employee to shift

                // Recursively attempt to assign next shift
                if (backtrack(shiftIdx + 1)) {
                    return true;
                }

                // If assignment didn't work out, backtrack
                schedule[shiftIdx] = null;
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

let pattern = createWorkPattern(dateRanges.length, 1, 5, 2);
let workPatternWithDates = assignDatesToWorkPattern(pattern, dateRanges);
let shiftSchedule = assignShifts2(workPatternWithDates);
// let staffSchedules = assignStaffToSchedule(employees, )
// console.log(shiftSchedule);

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
async function balanceAgentShifts(shifts: any) {
    if (!Array.isArray(shifts)) {
        throw new Error('Shifts are required and must be passed in as an array');
    }

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
            let prevShift = weeklyShifts[day - 1];
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
                    (night_shifts_count >= MAX_CONSECUTIVE_NIGHT_SHIFTS_PER_WEEK) &&
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

function give2DaysOff(weeklyShifts: string | any[], currentDay: number, nextDay: number) {
    console.log("2 days off")
    weeklyShifts[currentDay % weeklyShifts.length].shift = 5;
    weeklyShifts[nextDay % weeklyShifts.length].shift = 5;
}

const _balanceAgentShifts = balanceAgentShifts;
export { _balanceAgentShifts as balanceAgentShifts };

function checkAvailableShifts(employeeId: any) {
    employee.findById(employeeId).then((res: any) => {
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
function isEligibleForDayOff(currentSchedule: any, currentShift: any) {
}

/**
 * check if agent has worked 2 night shifts
 * @param {*} currentSchedule - current weekly shifts
 * @param {*} currentShift - current day shift
 * @return {boolean} - true
 */
function hasWorked2Nights(currentSchedule: string | any[], currentShift: any) {
    let n = currentSchedule.length;

    // iterate through current week and check if agent's previous shift was night shift
    for (let i = 0; i < n; i++) {
        if (currentSchedule[i] == currentShift) {

        }
    }
}
/**
 * 
 * @param {*} work_period 
 * @param {*} available_E 
 * @returns 
 */
function estimate_number(work_period: never[], available_E: Promise<any>) {
    return undefined;
}

/**
 * 
 * @param {*} work_period 
 * @param {*} people_sft_t 
 * @returns 
 */
function search_assignment(work_period: never[], people_sft_t: undefined) {
    return undefined;
}

/**
 * 
 * @param {*} fa - feasible assignment
 * @returns fs - feasible schedule
 */
function decide_flextime(available_E: number | undefined, ap: undefined, fa: undefined) {
    let fs = [];

    let matrix_fa = fa;
    let avg_fs = 10; // compute average proficiency for fs

    for (let d in fa) {
        let coverage = calculateCoverage(); // compute coverage of each time period for d
        let E_sft = getEmployees(sft_t);
        let sorted_sft = sortBy();

        for (let sft_t in SFT) {
            for (let tp in [1, 2, 3, 4, 5, 6]) {
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

function fs_schedule(employees: IEmployee[], day_range: any, work_period: any, max: number, min: number) {
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
function isValidSchedule2(proposedSchedule: string | any[]) {
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
function getRecentShifts(shifts: string | any[], currentDay: number) {
    return shifts.slice(Math.max(0, currentDay - 7), currentDay); // Look back at the last week
}

function getShiftType(day: number) {
    return day % 2 === 0 ? 'day' : 'night'
}

function canAssign(employee: { available: string | any[]; }, shiftId: any) {
    return employee.available.includes(shiftId);
}

// Function to determine if an employee can be assigned a shift on a given day
// Function to check if an employee can be assigned a shift based on constraints
function canAssignShift(employee: { shifts: any; }, day: any, shiftType: any) {
    const recentShifts = getRecentShifts(employee.shifts, day);

    // Check for consecutive day shifts
    const consecutiveDays = recentShifts.filter((shift: { type: { name: string; }; }) => shift.type.name === 'AM' || shift.type.name === 'PM' || shift.type.name === 'NS').length;
    const consecutiveNights = recentShifts.filter((shift: { type: { name: string; }; }) => shift.type.name === 'NS').length;

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

function balanceSchedules(schedules: any) {
    const SHIFTS = [1, 2, 3, 4, 5];

    let PERFECT_SHIFTS = [
        [1, 2, 3, 4, 5, 5, 2],
        [1, 1, 1, 1, 1, 0, 0],
        [1, 0, 0, 0, 0, 0, 0]
    ];
    const PERFECT_SHIFTS_LENGTH = PERFECT_SHIFTS.length;

    for (let i = 0; i < PERFECT_SHIFTS_LENGTH; i++) {
        const currentShift = PERFECT_SHIFTS[i];

        // if (squares[currentShift.shift]) {}

        // if () {

        // }
    }

    function backtrack(index: number, currentSchedule: any[], allSchedules: any[], shifts: string | any[]) {
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

    function generateSchedules(shifts: number[]) {
        const allSchedules: never[] = [];
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

function fishesYatesShuffle(array: string | any[]) {
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
    let weeklyShifts = [1, 2, 3, 4, 5, 6];
    let allShifts = [1, 2, 3, 9, 10, 11, 12, 13, 14, 15];
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
function myBacktrack(index: number, currentSchedule: any[], allSchedules: any[], shifts: never[]) {
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
function myBacktrack2(schedule: string[], shifts_list: string | any[]) {
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


const generateShiftSchedule = (employees: string | any[], daysInMonth: number) => {
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
    const printDaysInIntervals = (dateArray: string | any[]) => {
        const twoDayInterval: any[] = [];
        const threeDayInterval: any[] = [];
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

function calcSubset(A: string | any[], res: any[], subset: any[], index: number) {
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

function subsets(A: number[]) {
    const subset: never[] = [];
    const res: never[] = [];
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
        console.log('{' + res[i].join(', ') + '}');
    }
}
// main();



function isValidSchedule(schedule: any[]) {
    const agentCount = schedule.filter((emp: { type: string; }) => emp.type === 'agent').length;
    const managerCount = schedule.filter((emp: { type: string; }) => emp.type === 'manager').length;

    return agentCount === 9 && managerCount === 2;
}

function scheduleShifts(day: number, currentSchedule: any[]) {
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
function calculateCoverage(workload: any[] | undefined, assignedProficiency: { pair: any[]; shift: any; }[] | undefined) {
    return workload.map((period: { timePeriod: string | number; requiredProficiency: number; }) => {
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
function assignShifts(employee: any, daysWorked: number, maxDays: number, minDays: number) {
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
function adjustFlexTime(employee: any, shift: { coverage: number; end: number; start: number; }, targetCoverage: number) {
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
function pairwiseAllocate(employees: any[], shifts: string | any[]) {
    employees.sort((a: { proficiency: number; }, b: { proficiency: number; }) => a.proficiency - b.proficiency);
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
function topsisEvaluation(coverageArray: any[]) {
    let scores = coverageArray.map((cov: { coverage: number; }) => {
        return Math.abs(1 - cov.coverage);
    });
    return scores.reduce((a: any, b: any) => a + b) / scores.length;
}

/**
 * Ensure Constraints: Rest Days and Consecutive Working Days
 * @param {*} assignments 
 * @param {*} maxDays 
 * @param {*} minDays 
 * @param {*} restDays 
 * @returns 
 */
function applyConstraints(assignments: any[], maxDays = 5, minDays = 2, restDays = 1) {
    assignments.forEach((assignment: string | any[]) => {
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

    let workPattern = createWorkPattern(totalDays, 1, pattern[0], pattern[1]);
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
existingShiftSchedules.has("2",);
existingShiftSchedules.get("2");



const _ = require("underscore");
const {
  formatDistance,
  differenceInHours,
  getDaysInMonth,
  formatDate,
  format,
  getISOWeek,
  getDate,
  parse,
  getMonth,
  getYear,
  addDays,
  getDay,
} = require("date-fns");
const { daysInWeek } = require("date-fns/constants");
const asyncFn = require("async");
const { RRule, datetime, RRuleSet } = require("rrule");
const { Op } = require("sequelize");
const mathFn = require("mathjs");
const numericFn = require("numeric");
// const brainjs = require("brainjs");
const { groupByWeek, getDatesWithinRange } = require("./dateUtils");
// const { getSchedulesByDate } = require("./shiftFunctions");
const { getLeaveRequests } = require("../controllers/manager.controller");
const { SHIFT_TYPES, SUBGROUPS } = require("./constants");
const LinkedList = require("singly-linked-list").default;
const DecisionTree = require("decision-tree");
const simulatedAnnealing = require("simulated-annealing");

let MAX_CONSECUTIVE_SHIFTS_PER_WEEK = 5;
let MAX_CONSECUTIVE_NIGHT_SHIFTS_PER_WEEK = 2;
let MAX_CONSECUTIVE_OFFDAY_PER_WEEK = 2;
let EXPECTED_NUM_OF_WORKING_DAYS_PER_WEEK = 7;
let MAX_CONSECUTIVE_LEAVE_PER_WEEK = 2;

let SHIFT_PATTERNS = [
  { code: "5/2", name: "5-days-on-2-days-off", workDays: 5, offDays: 2 },
  { code: "3/1", name: "3-days-on-1-day-off", workDays: 3, offDays: 1 },
];

/**
 * Number of agents required for each role each shift
 */
const SHIFT_REQUIREMENTS = {
  [SHIFT_TYPES["6AM"]]: {
    totalAgents: 9,
    [SUBGROUPS.CALL]: 5,
    [SUBGROUPS.ONLINE]: 2,
    [SUBGROUPS["2IC"]]: 2,
  },
  [SHIFT_TYPES["8AM"]]: {
    totalAgents: 9,
    [SUBGROUPS.CALL]: 5,
    [SUBGROUPS.ONLINE]: 2,
    [SUBGROUPS["2IC"]]: 2,
  },
  [SHIFT_TYPES["2PM"]]: {
    totalAgents: 9,
    [SUBGROUPS.CALL]: 5,
    [SUBGROUPS.ONLINE]: 2,
    [SUBGROUPS["2IC"]]: 2,
  },
  [SHIFT_TYPES.NS]: {
    totalAgents: 2,
    [SUBGROUPS.CALL]: 1,
    [SUBGROUPS.ONLINE]: 0,
    [SUBGROUPS["2IC"]]: 1,
  },
};
let CONSTRAINTS = [
  { name: "MAX_CONSECUTIVE_SHIFTS_PER_WEEK", value: 5 },
  { name: "MAX_CONSECUTIVE_NIGHT_SHIFTS_PER_WEEK", value: 2 },
  { name: "MAX_CONSECUTIVE_OFFDAY_PER_WEEK", value: 2 },
  { name: "EXPECTED_NUM_OF_WORKING_DAYS_PER_WEEK", value: 7 },
  { name: "MAX_CONSECUTIVE_LEAVE_PER_WEEK", value: 2 },
  { name: "MAX_HOURS_PER_WEEK", value: 40 },
  { name: "HOURS_PER_SHIFT", value: 8 },
];

const constraints = [
  {
    // Constraint 1:
    check: (employee) => {
      const last5Days = employee.assignedShifts.slice(-5);
      return (
        last5Days.filter((shift) => shift !== SHIFT_TYPES.OFF).length <=
        MAX_CONSECUTIVE_SHIFTS_PER_WEEK
      );
    },
    penalty: 0.3,
  },
  {
    // Constraint 2: Honor preferred shifts
    check: (employee, newShift) => employee.preferredShifts.includes(newShift),
    penalty: 0.2, // Penalize if assigned non-preferred shifts
  },
  {
    // Constraint 3: Weekly hours cap
    check: (employee) => {
      const weeklyHours = employee.assignedShifts
        .filter((shift) => shift !== "OFF")
        .reduce((sum, shift) => sum + 8, 0); // 8 hours per shift
      return weeklyHours <= employee.maxHoursPerWeek;
    },
    penalty: 0.5, // Heavy penalty for exceeding hours
  },
];

const hardConstraints = [
  // Employee cannot exceed max shifts
  (emp, shift, assignments) => emp.assignedShifts.length < emp.maxShifts,
  // No overlapping shifts on the same day
  (emp, shift, assignments) =>
    !emp.assignedShifts.some((s) => s.day === shift.day),
];

const softConstraints = [
  // Penalize non-preferred shifts
  (emp, shift) => (emp.preferredShifts.includes(shift.type) ? 0 : 1),
  // Penalize uneven workload distribution
  (emp, shift, assignments) => {
    const totalShifts = Object.values(assignments).length;
    const avgShiftsPerEmp = totalShifts / employees.length;
    return Math.abs(emp.assignedShifts.length - avgShiftsPerEmp);
  },
];

function applyConstraints(dataPoints, constraints) {
  return dataPoints.map((data) => {
    let updatedWeight = data.weight;
    constraints.forEach((constraint) => {
      if (!constraint.check(data)) {
        updatedWeight -= constraint.penalty; // Apply penalty
      }
    });
    updatedWeight = Math.max(updatedWeight, 0); // Ensure weight ≥ 0
    return { ...data, weight: updatedWeight };
  });
}

let dataPoints = [];

const updatedData = applyConstraints(dataPoints, constraints);
const threshold = 0.5;
const filteredData = updatedData.filter((data) => data.weight >= threshold);
const sortedData = updatedData.sort((a, b) => b.weight - a.weight);
function weightedRandomSelection(data) {
  const totalWeight = data.reduce((sum, item) => sum + item.weight, 0);
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  for (const item of data) {
    cumulative += item.weight;
    if (random <= cumulative) return item;
  }
}

const selectedItem = weightedRandomSelection(updatedData);

function updateWeights(employees, constraints) {
  return employees.map((employee) => {
    let newWeight = employee.weight;
    constraints.forEach((constraint) => {
      if (!constraint.check(employee)) {
        newWeight -= constraint.penalty;
      }
    });
    newWeight = Math.max(newWeight, 0.1); // Never drop below 0.1
    return { ...employee, weight: newWeight };
  });
}

function assignShift(shiftType, employees) {
  // Filter employees available for the shift
  const candidates = employees.filter(
    (emp) => isAvailable(emp, shiftType) // Check availability (custom logic)
  );

  // Use weights for probabilistic selection (higher weight = better chance)
  const totalWeight = candidates.reduce((sum, emp) => sum + emp.weight, 0);
  const random = Math.random() * totalWeight;
  let cumulative = 0;

  for (const emp of candidates) {
    cumulative += emp.weight;
    if (random <= cumulative) {
      emp.assignedShifts.push(shiftType);
      return emp.id; // Assign shift to this employee
    }
  }
}

const totalDays = getDaysInMonth(new Date()); // Total days to schedule

// type PublicHolidays = {
//   name: string;
//   date: Date | string;
//   start: Date | string;
//   end: Date | string;
//   color: string;
// }

/**
 *
 */
let holidays = [
  { name: "New Year's Day", date: "2024-01-01" },
  {
    name: "National Remembrance Day of the Late First Prime Minister, Great Grand Chief Hon Sir Michael Thomas Somare",
    date: "2024-02-26",
  },
  { name: "Good Friday", date: "2024-03-29" },
  { name: "Easter Sunday", date: "2024-03-31" },
  { name: "Easter Monday", date: "2024-04-01" },
  { name: "King's Birthday", date: "2024-06-17" },
  { name: "National Remembrance Day", date: "2024-07-23" },
  { name: "National Repentance Day", date: "2024-08-26" },
  { name: "Independence Day", date: "2024-09-16" },
  { name: "Christmas Day", date: "2024-12-25" },
  { name: "Boxing Day", date: "2024-12-26", eventColor: "red" },
];

exports.public_holidays = holidays;

class Skill {
  constructor(name) {
    this.name = name;
  }
}

let skills = [
  new Skill("Call"),
  new Skill("2IC"),
  new Skill("Online"),
  new Skill("Reception"),
];

class ShiftGroup {
  constructor(name) {
    this.name = name;
    this.shifts = [];
  }
}

// let schedulesMap = {
//   date: {empId, shiftId}
// }

// let employeesMap = {
//   empId: {}
// }

// let shiftsMap = {
//   shiftId: {
//     date: empdId
//   }
// }

/**
 * Employee class models the employee, agent, and 2IC
 */
class Employee {
  #id;
  #available_dates = [];
  #schedules = new Map();
  preferred_shifts = [];
  preferred_work_days = [];
  hoursWorked = 0;
  assignedShifts = [];

  /**
   *
   * @param id
   * @param availableDates - shifts available for this employee
   */
  constructor(id, name, preferredWorkDays, preferredShifts) {
    this.#id = id;
    this.name = name;
    this.#available_dates = [];
    this.unavailable_dates = [];
    this.#schedules = []; // List of assigned shifts
    this.preferred_shifts = preferredShifts;
    this.preferred_work_days = preferredWorkDays;
    this.fatigue = 0;
    this.weight = 1.0;
    this.consecutiveShifts = 0; // Count of consecutive shifts worked
    this.daysOff = 0; // Count of days off taken
  }

  get getId() {
    return this.#id;
  }

  get schedules() {
    return this.#schedules;
  }

  // get preferred_shifts() {
  //   return this.preferred_shifts;
  // }

  // Method to count consecutive workdays
  countConsecutiveWorkdays() {
    let count = 0;
    for (let i = this.#schedules.length - 1; i >= 0; i--) {
      if (this.#schedules[i] !== "Off") {
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
    return (
      consecutiveDays < MAX_CONSECUTIVE_SHIFTS_PER_WEEK &&
      this.#schedules[day] !== "Assigned"
    );
  }

  canWork(shift) {
    // Check if the employee can work based on their schedule
    if (this.daysOff > 0) return false;

    // Check consecutive shift rules for agents
    if (this.type === "agent") {
      if (this.consecutiveShifts >= 5) return false; // Max consecutive shifts
      if (this.consecutiveShifts >= 3 && shift !== "night") return false; // After 3 shifts, need a day off
      if (
        this.#schedules.length >= 1 &&
        this.#schedules[this.#schedules.length - 1] === "night" &&
        shift === "night"
      ) {
        return false; // Two consecutive night shifts
      }
    }

    return true;
  }

  assignShift(shift) {
    this.#schedules.push(shift);
    this.consecutiveShifts++;
    this.daysOff = 0; // Reset days off
    this.hoursWorked += shift.duration;
  }

  takeDayOff() {
    this.daysOff++;
    this.consecutiveShifts = 0; // Reset consecutive shift count
  }

  availableShifts(date) {
    return this.preferred_shifts;
  }

  /**
   * Checks if the given *date* is not in the dates array
   * @param {Date} date
   * @param {Array<Date>} dates
   * @returns
   */
  isAvailable(date) {
    this.#schedules.get(date);
    return this.#available_dates.includes(date);
  }
}

/**
 * Shift represents a scheduled period of work
 * Availle shifts types are;
 * 6AM - 2PM
 * 8AM - 5PM
 * 2PM - 11PM
 * 11PM - 6AM
 * Day Off
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

    this.duration = Math.abs(
      differenceInHours(
        new Date(new Date().toLocaleDateString() + " " + end),
        new Date(new Date().toLocaleDateString() + " " + start)
      )
    );
  }
}

/**
 * Schedule is the collection of shifts
 * It covers one whole day
 */
class Schedule {
  shift;
  date;
  employee;

  constructor(date) {
    this.shift = null;
    this.date = date;
  }

  get shift() {
    return this.shift;
  }
  /**
   * @param {any} data
   */
  set shift(data) {
    this.shift = data;
  }

  get date() {
    return this.date;
  }

  /**
   * @param {any} date
   */
  set date(date) {
    this.date = date;
  }

  get employee() {
    return this.employee;
  }
  /**
   * @param {any} employee
   */
  set employee(employee) {
    this.employee = employee;
  }
}

/**
 * Roster is the collection of schedules
 * It covers whole month
 */
class Roster {
  #name;
  #schedules = [];
  #dateStart;
  #dateEnd;
  subgroupId;

  /**
   *
   * @param {Date} date_start
   * @param {Date} date_end
   * @param {string} name
   * @param {number} subgroupId
   */
  constructor(date_start, date_end, name, subgroupId) {
    if (date_start) date_start = new Date(date_start);
    if (date_end) date_end = new Date(date_end);

    this.#name = name;
    this.#dateStart = date_start;
    this.#dateEnd = date_end;
    this.#schedules = new Array(this.#schedules.length).fill(null);
    this.subgroupId = subgroupId;
  }

  addShift(shift) {
    this.shift.push(shift);
    return this;
  }

  removeShift(shift) {
    this.shift[this.shift.indexOf(shift)];
  }

  shuffleShift() {
    _.shuffle(this.shift);
  }

  /**
   * Optimizes the shift schedules
   */
  optimize() {
    for (let i in this.shift) {
      let res = this.shift[i];
    }
  }

  populateShifts() {
    // Create a 3D array (matrix)
    this.shift = Array.from({ length: numEmployees }, () =>
      Array.from(
        { length: numDays },
        () => Array(numShifts).fill(0) // Initialize with 0 (no shift assigned)
      )
    );
  }

  addSchedule(schedule) {
    this.#schedules.push(schedule);
  }

  getSchedule(index) {
    if (!this.#schedules.length > 0) {
      throw Error("Roster do not have any schedules.");
    }

    return this.#schedules[index];
  }

  /**
   * Get all schedules for a specific date
   * @param {string} date - Date in 'YYYY-MM-DD' format
   * @returns {Array<Schedule>}
   */
  getSchedulesByDate(date) {
    return this.#schedules.filter((schedule) => schedule.date === date);
  }

  /**
   * Get all schedules for a specific employee
   * @param {number} employeeId
   * @returns {Array<Schedule>}
   */
  getSchedulesByEmployee(employeeId) {
    return this.#schedules.filter(
      (schedule) => schedule.employeeId === employeeId
    );
  }

  displaySchedules() {
    for (let shift of this.#schedules) {
      console.log(shift);
    }
  }

  /**
   * Display roster summary
   */
  displayRoster() {
    console.log(`Roster: ${this.#name}`);
    this.#schedules.forEach((schedule) => {
      console.log(
        `Employee ID: ${schedule.employeeId}, Date: ${schedule.date}, Shift: ${schedule.shift.name}`
      );
    });
  }

  displaySchedulesInWeeks() {
    let weeks = groupByWeek(this.#dateStart, this.#dateEnd);
    weeks.forEach((week) => {
      console.log(`Week ${getISOWeek(week[0])}`);
      console.log(week);
    });
  }

  toString() {
    this.shift.map((shift) => {
      console.log(shift);
      return shift;
    });
  }
}

/**
 * Scheduling Horizon (`D`) - Create an array representing each day within the scheduling period.
 */
const schedulingHorizon = Array.from({ length: totalDays }, (_, i) => i + 1);

// Sample data: Employees and their shift types
const employees = [
  new Employee(1, "Agent A", [0, 1, 1, 0, 1, 1, 0], [1, 2, 3, 5]),
  new Employee(2, "Agent B", [1, 1, 0, 1, 0, 1, 1], [1, 2, 3, 5]),
  new Employee(3, "Agent C", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(4, "Agent D", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(5, "Agent E", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(6, "Agent F", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(7, "Agent G", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(8, "Agent H", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(9, "Agent I", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(10, "Agent J", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(11, "Agent K", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(12, "Agent L", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(13, "Agent M", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(14, "Agent N", [0, 0, 1, 1, 1, 0, 0], [1, 2, 3, 5]),
  new Employee(15, "Olivia", [5, 6], [1, 2, 3, 4, 5]),
  new Employee(16, "Paul", [0, 4], [1, 2, 3, 4, 5]),
  new Employee(17, "Quinn", [1, 6], [1, 2, 3, 4, 5]),
  new Employee(18, "Rachel", [3, 5], [1, 2, 3, 4, 5]),
  new Employee(19, "Sam", [4, 6], [1, 2, 3, 4, 5]),
  new Employee(20, "Tina", [2, 5], [1, 2, 3, 4, 5]),
  new Employee(21, "Uma", [3, 0], [1, 2, 3, 4, 5]),
  new Employee(22, "Victor", [1, 4], [1, 2, 3, 4, 5]),
  new Employee(23, "Wendy", [0, 3], [1, 2, 3, 4, 5]),
  new Employee(24, "Xander", [5, 1], [1, 2, 3, 4, 5]),
  new Employee(25, "Yara", [4, 0], [1, 2, 3, 4, 5]),
  new Employee(26, "Zane", [6, 3], [1, 2, 3, 4, 5]),
  new Employee(27, "Alicea", [1, 5], [1, 2, 3, 4, 5]),
  new Employee(28, "Benny", [0, 6], [1, 2, 3, 4, 5]),
  new Employee(29, "Cathy", [3, 4], [1, 2, 3, 4, 5]),
  new Employee(30, "Derek", [6, 1], [1, 2, 3, 4, 5]),
  new Employee(31, "Ella", [0, 3], [1, 2, 3, 4, 5]),
  new Employee(32, "Finn", [1, 4], [1, 2, 3, 4, 5]),
  new Employee(33, "Gina", [3, 5], [1, 2, 3, 4, 5]),
  new Employee(34, "Hugo", [0, 6], [1, 2, 3, 4, 5]),
  new Employee(35, "Isla", [1, 6], [1, 2, 3, 4, 5]),
  new Employee(36, "Jake", [4, 5], [1, 2, 3, 4, 5]),
  new Employee(37, "Lara", [0, 4], [1, 2, 3, 4, 5]),
  new Employee(38, "Mark", [1, 3], [1, 2, 3, 4, 5]),
  new Employee(39, "Nina", [5, 6], [1, 2, 3, 4, 5]),
  new Employee(40, "Michelle", [0, 1], [1, 2, 3, 4, 5]),
  new Employee(41, "Alice", [5, 6], [1, 2, 3, 4, 5]),
  new Employee(42, "Bob", [2, 6], [1, 2, 3, 4, 5]),
  new Employee(43, "Charlie", [1, 6], [1, 2, 3, 4, 5]),
  new Employee(44, "Diana", [4, 5], [1, 2, 3, 4, 5]),
  new Employee(45, "Evan", [0, 6], [1, 2, 3, 4, 5]),
  new Employee(46, "Fiona", [5, 6], [1, 2, 3, 4, 5]),
  new Employee(47, "George", [3, 6], [1, 2, 3, 4, 5]),
  new Employee(48, "Hannah", [0, 6], [1, 2, 3, 4, 5]),
  new Employee(49, "Ivy", [2, 4], [1, 2, 3, 4, 5]),
  new Employee(50, "Jack", [3, 5], [1, 2, 3, 4, 5]),
  new Employee(51, "Kate", [0, 1], [1, 2, 3, 4, 5]),
  new Employee(52, "Leo", [4, 6], [1, 2, 3, 4, 5]),
  new Employee(53, "Mia", [2, 3], [1, 2, 3, 4, 5]),
  new Employee(54, "Nathan", [1, 5], [1, 2, 3, 4, 5]),
];
// employees[0].isAvailable(date);

let startDate = "2024/11/01";
let endDate = "2024/11/30";
// const roster = new Roster(new Date(2024, 12, 1), new Date(2024, 12, 31));

// let shift1 = new Shift(1, "AM", "6AM", "06:00:00", "14:00:00");
// let shift2 = new Shift(2, "AM", "8AM", "08:00:00", "17:00:00");
// let shift3 = new Shift(3, "PM", "2PM", "14:00:00", "23:00:00");
// let shift4 = new Shift(4, "NS", "11PM", "22:00:00", "06:00:00");
// let shift5 = new Shift(5, "OF", "OFF", "00:00:00", "23:59:00");
const shifts = [
  // shift1,
  // shift2,
  // shift3,
  // shift4,
  // shift5,
  new Shift(1, "AM", "6AM", "06:00:00", "14:00:00"),
  new Shift(2, "AM", "8AM", "08:00:00", "17:00:00"),
  new Shift(3, "PM", "2PM", "14:00:00", "23:00:00"),
  new Shift(4, "NS", "11PM", "23:00:00", "06:00:00"),
  new Shift(5, "DO", "OFF", "00:00:00", "23:59:00"),
];
// Max Fatigue Threshold: 100
const shifts4 = [
  { id: "6AM", hours: 9, fatigueFactor: 14, subgroups: [1, 2, 3, 4, 5] },
  { id: "8AM", hours: 9, fatigueFactor: 10, subgroups: [1, 2, 3, 4, 5] },
  { id: "2PM", hours: 9, fatigueFactor: 9, subgroups: [1, 2, 3, 4, 5] },
  { id: "10PM", hours: 8, fatigueFactor: 18, subgroups: [1, 2, 3, 4, 5] },
  { id: "OFF", hours: 24, fatigueFactor: -20, subgroups: [1, 2, 3, 4, 5] },
];

// let schedule1 = new Schedule(new Date(2024, 12, 13));
// schedule1.addShift(shift1);
// schedule1.addShift(shift2);
// roster.addSchedule(schedule1);

// let schedule2 = new Schedule(new Date(2024, 12, 14));
// schedule2.addShift(shift3);
// roster.addSchedule(schedule2);

// let schedule3 = new Schedule(new Date(2024, 12, 18));
// schedule3.addShift(shift4);
// schedule3.addShift(shift5);
// roster.addSchedule(schedule3);

// roster.displaySchedules();
// roster.displaySchedulesInWeeks();

// const dateSchedules = roster.getSchedulesByDate("2024-01-01");
// console.log("Schedules for 2024-01-01:", dateSchedules);

/**
 * Main function, coordinates the process of creating a schedule
 * @returns
 */
function generateSchedule(employees, shifts, hardConstraints, softConstraints) {
  let range,
    failedShifts = [];

  const numEmployees = 100;
  const numDays = 7;
  const numShifts = 5;

  let schedules = new Schedule(new Date(2024, 10, 17));
  schedules.addShift(shift1);
  schedules.addShift(shift2);
  schedules.addShift(shift3);
  schedules.addShift(shift4);
  schedules.addShift(shift5);

  range = [0, 1];

  // Create a 3D array (matrix)
  // let shifts = Array.from({ length: numEmployees }, () =>
  //   Array.from(
  //     { length: numDays },
  //     () => Array(numShifts).fill(0) // Initialize with 0 (no shift assigned)
  //   )
  // );

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
      console.log(
        `Assigned Shift ${shiftIndex} to Employee ${employeeIndex} on Day ${dayIndex}`
      );
    } else {
      console.log(
        `Shift ${shiftIndex} already assigned to Employee ${employeeIndex} on Day ${dayIndex}`
      );
    }
  }

  function assignedShiftFairly(employeeIndex, dayIndex, shiftIndex) {
    const totalShifts = numDays * numShifts;
    const assignedShifts = shifts.flat().filter((shift) => shift === 1).length;
    const minShiftsPerEmployee = Math.floor(totalShifts / numEmployees);
    const maxShiftsPerEmployee = Math.ceil(totalShifts / numEmployees);

    // Check if the employee has already reached their maximum shifts
    const currentShifts = shifts[employeeIndex]
      .flat()
      .filter((shift) => shift === 1).length;

    if (currentShifts < maxShiftsPerEmployee) {
      shifts[employeeIndex][dayIndex][shiftIndex] = 1; // Assign shift
      console.log(
        `Assigned Shift ${shiftIndex} to Employee ${employeeIndex} on Day ${dayIndex}`
      );
    } else {
      console.log(
        `Employee ${employeeIndex} has reached their maximum shifts.`
      );
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
          console.log(
            `Employee ${emp} has overlapping shifts on Day ${day}: ${assignedShifts}`
          );
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
        assignedShiftFairly(empIndex, dayIndex, shiftIndex);
      }
    }
  }

  checkOverlaps();
  checkConstraints();
  // displayShifts()

  // console.log(shifts)

  return {
    scheduledShifts: schedules.toString(),
    failedShifts,
    success: failedShifts.length === 0,
    start: range[0],
    end: range[1],
  };
}

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

// exports.generateSchedule = generateSchedule;
// exports.Shift = Shift;
// exports.Schedule = Schedule;
// exports.Roster = Roster;

/**
 * Get the available dates for an employee
 * available dates: dates the range of confirm leave dates
 * @param {number} empId
 * @returns {Array<string>} available_dates
 */
async function getEmployeeAvailableDates(empId) {
  let start_date = "2025-01-01";
  let end_date = "2025-01-31";
  let planning_horizon_dates = getDatesWithinRange(start_date, end_date);
  let confirmed_leave_dates = await getEmployeeConfirmedLeaveDates(empId);
  let required_work_days = getRequiredWorkingDays();
  let required_work_dates_set = new Set([1, 2, 3, 4, 5]);
  let confirmed_leave_dates_set = new Set(confirmed_leave_dates);
  let planning_horizon_dates_set = new Set(planning_horizon_dates);
  let available_dates = planning_horizon_dates_set.difference(
    confirmed_leave_dates_set
  );

  return available_dates;
}

/**
 * Returns the required working days for a specific subgroup
 * @param {*} subgroupId
 * @returns [0,1,2,3,4,5,6] - Monday to Sunday
 */
function getRequiredWorkingDays(subgroupId) {
  switch (subgroupId) {
    case SUBGROUPS["2IC"]: // CC 2IC
      return [0, 1, 2, 3, 4, 5, 6];
    case SUBGROUPS.ONLINE: // CC Online Agents
      return [0, 1, 2, 3, 4, 5, 6];
    case SUBGROUPS.NCSL: // NCSL CC Agents
      return [0, 1, 2, 3, 4, 5, 6];
    case SUBGROUPS.ADMIN: // Admin
      return [0, 1, 2, 3, 4, 5, 6];
    case SUBGROUPS.MANAGER: // Managers
      return [0, 1, 2, 3, 4, 5, 6];
    case SUBGROUPS.RECEPTION: // Reception
      return [1, 2, 3, 4, 5];
    default:
      return [0, 1, 2, 3, 4, 5, 6];
  }
}

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
    console.log("Scheduled Shifts:", schedule);
    // console.log('Employee: ', employees[0].shifts)
    return schedule;
  } else {
    return "No valid schedule found";
  }
}

// const result = scheduleEmployees(employees, shifts);
// console.log('Scheduled Employees:', result);
// scheduleEmployees2(employees, shifts)

/**
 * assign shifts to work pattern
 * @param {*} workPatternWithDates
 * @returns
 */
function assignShifts2(workPatternWithDates) {
  if (workPatternWithDates.length < 0) {
    return [];
  }
  let schedule = [];

  workPatternWithDates.forEach((pattern, day) => {
    let sft = pattern.shift;

    schedule.push({
      date: pattern.date,
      shift: sft,
    });
  });

  return schedule;
}

function scheduleEmployees(employees, shifts) {
  let schedule = {};

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
    return "No valid schedule found";
  }
}

// const dateRanges = getDatesWithinRange(startDate, endDate);
// let pattern = generateWorkPattern(dateRanges.length, 1, 5, 2);
// let workPatternWithDates = assignDatesToWorkPattern(pattern, dateRanges);
// let shiftSchedule = assignShifts2(workPatternWithDates);
// let staffSchedules = assignStaffToSchedule(employees, )
// console.log(shiftSchedule);

// exports.shiftSchedule = shiftSchedule;

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
    throw new Error("Shifts are required and must be passed in as an array");
  }

  const TSHIFTS_2 = Object.freeze({
    Morning: 1,
    Midday: 2,
    Afternoon: 3,
    Night: 4,
    DayOff: 5,
  });

  const TSHIFTS = Object.freeze({
    1: "AM",
    2: "AM",
    3: "PM",
    4: "NS",
    5: "DF",
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

    // take leave_types into consideration

    // run through daily shifts
    for (let day = 1; day < weeklyShiftsTotal; day++) {
      let prevShift = weeklyShifts[day - 1];
      let currentShift = weeklyShifts[day];

      console.log("current shift: ", currentShift);

      // if agent is on leave, then skip
      if (is_on_leave) {
        currentShift.shift = 0; // day off
        // break;
      } else {
        // if agent was working 5 consecutive shifts, then put agent off for 2 days
        if (shifts_count > MAX_SHIFT_PER_WEEK) {
          currentShift.shift = 5;
        }

        // if agent was working 2 consecutive night shifts, then put agent off for 2 days
        if (
          night_shifts_count >= MAX_CONSECUTIVE_NIGHT_SHIFT_PER_WEEK &&
          is_consecutive_night_shift
        ) {
          currentShift.shift = 5;
        }

        // if agent is taking 2 consecutive day off, then put agent back to shift
        if (
          dayoff_count > MAX_CONSECUTIVE_DAYOFF_PER_WEEK &&
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
    console.log("------------- reset -------------");
    console.log("consec night shift count: ", night_shifts_count);
    console.log("shifts count: ", shifts_count);
    console.log("------------- reset -------------");
  }

  // console.log(shiftsInWeeks)

  return shiftsInWeeks.flat();
}

exports.balanceAgentShifts = balanceAgentShifts;

function give2DaysOff(weeklyShifts, currentDay, nextDay) {
  console.log("2 days off");
  weeklyShifts[currentDay % weeklyShifts.length].shift = 5;
  weeklyShifts[nextDay % weeklyShifts.length].shift = 5;
}

function checkAvailableShifts(employeeId) {
  employee.findById(employeeId).then((res) => {
    // console.log(employee)
    // if employee is on leave, then employee is not available for any shifts
    // if (employee) {
    // }
    // get all shifts for employee
    // else {
    // }
  });
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

const Calculate_Profesioncy = () => {};

const Avg_Coverage = (total_assigned_employees, w) => {
  [1 - (1 / n) * w];

  for (let i = 1; i < n; i++) {
    for (let j = 1; j < w; j++) {}
  }
};

// Function to satisfy constraints
function SATISFY_CONSTRAINT(employees, max, min, day, D) {
  let available_E = [];
  let days = [1, 2, 3, 4, 5, 6, 7];

  // const DCT = [];

  // employees.forEach((employee) => {
  //   // Check if the employee can work on the specified day
  //   if (!employee.canWorkOnDay(day)) {
  //     DCT.push(employee);
  //   }
  // });

  // for (let i = 0; i < totalDays; i++) {
  //   for (let j = 0; j < employees.length; j++) {
  //     let isAvailable = DCT.includes(j);
  //     if (isAvailable) {
  //       available_E.push(j);
  //     }
  //   }
  // }

  // return available_E;

  for (let employee of employees) {
    // get all employees that are not on 'day off' and are not taking 'leave_types'
    if (employee.isOnLeave) {
      continue;
    } else {
      if (employee.shift.shif_name === "off") {
        available_E.push(employee);
      }
    }
  }

  for (let day of days) {
    for (let employee of employees) {
      let g = search();
    }
  }

  return available_E;
}

function SATISFY_HCONSTRAINT() {
  let NUM = 0;
  let min = 3;
  let max = 5;
  let signG = [];
  let G = [];

  if (NUM < min) {
    // all employees are available
  }
  if (
    min <= NUM &&
    NUM <= max &&
    isElement(signG, NUM) &&
    forAll(G, (g) => g <= NUM)
  ) {
    // employee is unavailable
  }
  if (
    min <= NUM &&
    NUM <= max &&
    isElement(signG, NUM) &&
    thereExist(G, (g) => g > NUM)
  ) {
    // employee is available
  }
}

// ESTIMATED_NUMBER();
// fs = SEARCH_ASSIGNMENT()
// for (let employee in employees) {
//   if (!employee.isAvailable) {
//     // calculateDCT()
//     // renew DCT of employee
//   }
// }

function thereExist(arr, predicate) {
  return arr.some(predicate);
}

function forAll(arr, predicate) {
  return arr.every(predicate);
}

function isElement(arr, element) {
  return arr.includes(element);
}

function sum(i, n, data) {
  let s = [];
  for (; i < n; i++) {
    const element = data[i];
    s.push(element);
  }

  return s.reduce((a, b) => a + b, 0);
}

/**
 *
 * @param {Array<Object>} available_E
 * @param {Array<Object>} work_period
 * @returns
 */
function ESTIMATED_NUMBER(available_E, work_period) {
  // let share_TP = count sharing work time periods;
  // let AW_share_TPz = compute avg workload of the time periods in share_TPz
  // WF(SFT, AW_share_TP) <- AW_share_TPz = sum(1, 5, W_sft_t);
  // EW_sft_t <-
  let average_AP = Calculate_Profesioncy(available_E[0]);
  let people_sft_t = Math.round(ap_sft_t / average_AP);
  return people_sft_t;
}

/**
 *
 * @param {*} AP
 * @param {*} people_d
 * @returns
 */
function SEARCH_ASSIGNMENT(AP, people_d) {
  let assignment = [];
  AP = _.sortBy(work_period, "time");
  let [AP1, AP2] = average_AP;
  let PAM = computeAverageAP(AP1, AP2);

  for (let pj in AP1) {
    for (let pk in AP2) {
      _.sortBy(people_d, "time");

      for (let people_sft_t in people_d) {
        // {L1,R1} = (pj, pk)
        // let ec1 = find the corresponding employees of pj,pk in AP
        let Ep2 = 2 * average_AP - average_ec1;
        delete PAM[ec1];
        delete AP1[ec1];
        delete AP2[ec1];
        // let ec2 = search in PAM
        delete PAM[ec2];
        delete AP1[ec2];
        delete AP2[ec2];
        // search ec[i] until employee quantity of {ec[1],ec[2],...,ec[i-1]} equals to people_DS[i]
      }

      // EC_sft_t = {ec[1],ec[2],...,ec[i-1]}
      assignment.push(EC_sft_t);
    }
  }

  fs = TOPSIS(assignment);

  return fa;
}

/**
 *
 * @param {*} fa - feasible assignment
 * @returns fs - feasible schedule
 */
function DECIDE_FLEXTIME(available_E, ap, fa) {
  let fs = [];

  let Matrix_fa = fa;
  let Average_fs = 10; // compute average proficiency for fs

  for (let d in fa) {
    let coverage = calculateCoverage(); // compute coverage of each time period for d
    let E_sft_t = getEmployees(sft_t);
    let P_sft_t = _.sortBy();

    for (let sft_t in SFT) {
      for (let tp in [1, 2, 3, 4, 5, 6]) {
        if (coverage >= Average_fs) {
          for (let e_sft in E_sft_t) {
            e_sft = "rest";
          }
        }
      }

      for (let tp in [1, 30]) {
        if (coverage >= Average_fs) {
          for (let e_sft in E_sft_t) {
            e_sft = "rest";
          }
        }
      }
    }
    fs.push(E_sft_t);
  }

  return fs;
}

function fs_schedule(
  employees,
  day_range,
  work_period,
  max_work_days,
  min_work_days
) {
  let fs = [];
  let fa;

  for (let day in day_range) {
    let available_E = SATISFY_CONSTRAINT(
      employees,
      max_work_days,
      min_work_days,
      day
    );
    let people_sft_t = ESTIMATED_NUMBER(work_period, available_E);
    fa = SEARCH_ASSIGNMENT(work_period, people_sft_t);
  }

  fs = DECIDE_FLEXTIME(fa);

  return fs;
}

// Function to calculate Dynamic Cycle Time (DCT)
function calculateDCT(totalDays, restDays, currentDate) {
  // Get the current day of the year
  const startOfYear = new Date(currentDate.getFullYear(), 0, 0);
  const diff = currentDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const currentDayOfYear = Math.floor(diff / oneDay);

  // Calculate remaining days until the end of the year
  const remainingDays = totalDays - currentDayOfYear;

  // Calculate DCT based on working days and rest days
  let dct = remainingDays / (totalDays / (totalDays - restDays));

  return Math.max(0, Math.round(dct)); // Ensure DCT is not negative
}

// Current date: Sunday, January 19, 2025, 6 AM +10
// const currentDate = new Date('2025-01-19T06:00:00+10:00');

// // Example usage
// const totalWorkingDays = 31; // Total number of working days in a cycle
// const totalRestDays = 3;      // Total number of rest days in a cycle

// const dct = calculateDCT(totalWorkingDays, totalRestDays, currentDate);
// console.log(`Dynamic Cycle Time (DCT): ${dct}`);

function generateDynamicCombinationTable(employees, shifts) {
  const combinationTable = {};

  // Initialize the combination table with shifts
  shifts.forEach((shift) => {
    combinationTable[shift.id] = [];
  });

  // Populate the combination table with employee names based on their available shifts
  employees.forEach((employee) => {
    employee.preferred_shifts.forEach((shift) => {
      if (combinationTable[shift]) {
        combinationTable[shift].push(employee.name);
      }
    });
  });

  return combinationTable;
}

// const dct = generateDynamicCombinationTable(employees, shifts);
// console.log("Dynamic Combination Table:");
// console.log(dct);

// Sample DCT for 7-day scheduling horizon
const DCT = [
  { id: 1, days: "work|work|work|work|work|rest|rest" },
  { id: 2, days: "work|work|work|rest|work|work|work" },
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
  if (Array.isArray(proposedSchedule))
    proposedSchedule = proposedSchedule.join("|").toLowerCase();

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
  return day % 2 === 0 ? "day" : "night";
}

/**
 * Check the availability of the agent
 * @param {*} employee
 * @param {*} shiftId
 * @returns
 */
// Function to determine if an employee can be assigned a shift on a given day
// Function to check if an employee can be assigned a shift based on constraints
function canAssign(employee, shiftId) {
  return employee.available.includes(shiftId);
}

function canAssignShift(employee, day, shiftType) {
  const recentShifts = getRecentShifts(employee.shifts, day);

  // Check for consecutive day shifts
  const consecutiveDays = recentShifts.filter(
    (shift) =>
      shift.type.name === "AM" ||
      shift.type.name === "PM" ||
      shift.type.name === "NS"
  ).length;
  const consecutiveNights = recentShifts.filter(
    (shift) => shift.type.name === "NS"
  ).length;

  // Check constraints
  if (
    consecutiveDays >= MAX_CONSECUTIVE_SHIFTS_PER_WEEK ||
    consecutiveNights >= MAX_CONSECUTIVE_NIGHT_SHIFTS_PER_WEEK
  ) {
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
  const SHIFTS = [1, 2, 3, 4, 5];

  let PERFECT_SHIFTS = [
    [1, 2, 3, 4, 5, 5, 2],
    [1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0],
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
    console.log(
      `Combinations for row ${index + 1}:`,
      validSchedules.slice(0, 5)
    );
  });
}

// balanceSchedules([]);

/**
 * fishesYatesShuffle - a simple shuffle by Fisher Yates
 * @param {*} array
 * @returns
 */
function fishesYatesShuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

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

/**
 * swap - a simple swap function
 * @param {*} a
 * @param {*} b
 * @returns
 */
function swap(a, b) {
  let temp = a;
  a = b;
  b = temp;

  return { a, b };
}

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
    allSchedules.push([...currentSchedule]);
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

/**
 * Place NS on users
 * Each date in a scheduling horizon requires 1 NS per subgroup
 * To assign a night shift to an employee;
 * the employee must
 * @returns
 */
function solveAgentSchedulingProblem() {
  let res = [];
  let weeklyShifts = [1, 2, 3, 4, 5, 6];
  let allShifts = [1, 2, 3, 9, 10, 11, 12, 13, 14, 15];
  // let used = new Array(nums.length).fill(false);

  myBacktrack(0, weeklyShifts, allShifts, []);
  return weeklyShifts;
}

// let s = solveAgentSchedulingProblem()
// console.log(s)

let myBacktrackResult = [];
function myBacktrack2(schedule, shifts_list) {
  if (shifts_list.length === schedule.length) {
    myBacktrackResult.push(schedule);
    return true;
  }

  for (let shift in shifts_list) {
    schedule.push(shift);
    myBacktrack2(schedule, shifts_list);
    schedule.pop();
  }
}

// myBacktrack2([], shifts)
// console.log(myBacktrackResult)

const generateShiftSchedule = (employees, daysInMonth) => {
  const shifts = ["Morning", "Afternoon", "Night"];
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
          if (
            schedule[employee][shift] < Math.floor(daysInMonth / shifts.length)
          ) {
            schedule[employee][shift]++;
            assigned++;
          }

          if (assigned === employees.length) {
            break;
          }
        }

        // Handle days off after Midnight shift
        if (shift === "Night") {
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
        if (
          !threeDayInterval.includes(dateArray[i]) &&
          !twoDayInterval.includes(dateArray[i])
        ) {
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
  };
};

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
    console.log("{" + res[i].join(", ") + "}");
  }
}
// main();

function isValidSchedule(schedule) {
  const agentCount = schedule.filter((emp) => emp.type === "agent").length;
  const managerCount = schedule.filter((emp) => emp.type === "manager").length;

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

  console.log("No valid schedule: ", currentSchedule);
  return false;
}

// Start scheduling from day 0 with an empty schedule
// scheduleShifts(0, [...agents, ...managers]);

const workload = [
  { timePeriod: 8, requiredProficiency: 35 },
  { timePeriod: 9, requiredProficiency: 30 },
];

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
  return workload.map((period) => {
    const assigned = assignedProficiency[period.timePeriod] || 0;
    return {
      timePeriod: period.timePeriod,
      coverage: assigned / period.requiredProficiency,
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
      pair: pair.map((emp) => emp.id),
      shift: shift.type,
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
  let scores = coverageArray.map((cov) => {
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
  assignments.forEach((assignment) => {
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
    { type: 3, start: 10, end: 18, meal: [13, 14] },
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

  for (let day = 1; day < totalDays + 1; day++) {
    let assignments = pairwiseAllocate(employees, shifts);

    assignments.forEach((assignment) => {
      assignment.shift = adjustFlexTime(
        assignment.pair[0],
        assignment.shift,
        1.0
      ); // target coverage
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
function generateManagerSchedule() {
  let pattern = [3, 1];
  let days = schedulingHorizon;

  // let schedule = new Schedule(new Date())
  // schedule

  // let workPattern = generateWorkPattern(totalDays, 2, pattern[0], pattern[1]);
  // console.log(workPattern);

  let schedule = {};
  for (let e of employees2) {
    for (let d of days) {
      for (let s of shifts) {
        if (schedule[e][d][s]) {
          schedule[e][d][s] = 1;
        } else {
          schedule[e][d][s] = 0;
        }
      }
    }
  }
}
// generateManagerSchedule();

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


get employees by subgroup
for each employee do
    workSchedule = generateWorkschedule(emp, numDays, workPattern)
    for each workSchedule do
        shifts = getFeasibleShifts(day, emp)

# Pseudo-code
agents <- fetchAgents
for each agents do


set scheduling horizon to weekly, monthly

for each employee e in employees E
generate work pattern
assigs shifts
backtrack for any overlaps of constraints

*/

// const existingShiftSchedules = new Map();
// existingShiftSchedules.set("2", "3");
// existingShiftSchedules.has("2");
// existingShiftSchedules.get("2");

// Function to create the new schedule
function createMonthlySchedule(employees = [], previousSchedule = []) {
  const newSchedule = [];

  // Loop through each day of the month (assuming a month with 30 days)
  for (let day = 1; day <= 30; day++) {
    const previousShift = previousSchedule.find((s) => s.day === day);

    // Determine the shift type from the previous month
    const shiftType = previousShift ? previousShift.shift : shifts[0]; // Default to Morning if no data

    // Find available employees for the selected shift type
    const availableEmployees = employees.filter(
      (employee) => employee.available[day % 7] === 1 // Check availability (modulus for weekly cycle)
    );

    // If there are available employees for this shift
    if (availableEmployees.length > 0) {
      // Randomly select an employee from available ones
      const selectedEmployee =
        availableEmployees[
          Math.floor(Math.random() * availableEmployees.length)
        ];
      newSchedule.push({
        day,
        shift: shiftType,
        employeeId: selectedEmployee.id,
      });
    } else {
      console.log(`No available employees for Day ${day} Shift ${shiftType}`);
    }
  }

  return newSchedule;
}

// Generate and display the new schedule
// const newMonthlySchedule = createMonthlySchedule(agents, previousMonthSchedule);
// console.log("New Monthly Shift Schedule:", newMonthlySchedule);

// asyncFn.waterfall([

// ], function(err, result) {
//     if (err) throw err;

//     console.log(result)
// })

// console.log(fetchSchedules)

// // Create a rule:
// const rule = new RRule({
//   freq: RRule.YEARLY,
//   // interval: 5,
//   // byweekday: [RRule.MO, RRule.FR],
//   dtstart: datetime(2021, 2, 6),
//   // until: datetime(2024, 12, 1),
// });

// Get all occurrence dates (Date instances):
// console.log(rule.all());

// Get a slice:
// console.log(rule.between(datetime(2012, 8, 1), datetime(2012, 9, 1)))

// Get an iCalendar RRULE string representation:
// The output can be used with RRule.fromString().
// console.log(rule.toString());

// Get a human-friendly text representation:
// The output can be used with RRule.fromText().
// console.log(rule.toText());

// const rruleSet = new RRuleSet();
// rruleSet.rrule(
//   new RRule({
//     freq: RRule.YEARLY,
//     count: 5,
//     dtstart: datetime(2021, 2, 6)
//   })
// )
// rruleSet.rdate(datetime(2012, 7, 1));
// console.log(rruleSet.all());

class GeneticAlgorithm {
  constructor(
    populationSize,
    mutationRate,
    maxGenerations,
    employees,
    shifts,
    constraints
  ) {
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.maxGenerations = maxGenerations;
    this.employees = employees;
    this.shifts = shifts;
    this.constraints = constraints; // Constraints like max hours, availability
    this.population = [];
  }

  // Generate a random schedule
  generateRandomSchedule() {
    return this.shifts.map((shift) => {
      const availableEmployees = this.employees.filter((employee) =>
        this.isAvailable(employee, shift)
      );
      return availableEmployees.length
        ? availableEmployees[
            Math.floor(Math.random() * availableEmployees.length)
          ].id
        : null;
    });
  }

  // Initialize population
  initializePopulation() {
    for (let i = 0; i < this.populationSize; i++) {
      const schedule = this.generateRandomSchedule();
      this.population.push({
        schedule,
        fitness: this.evaluateFitness(schedule),
      });
    }
  }

  // Evaluate fitness of a schedule
  evaluateFitness(schedule) {
    let fitness = 0;

    const employeeShiftCount = {};
    schedule.forEach((employeeId) => {
      if (!employeeId) return;
      employeeShiftCount[employeeId] =
        (employeeShiftCount[employeeId] || 0) + 1;
    });

    // Reward balanced shift distribution
    const shiftCountValues = Object.values(employeeShiftCount);
    const maxShiftCount = Math.max(...shiftCountValues, 0);
    const minShiftCount = Math.min(...shiftCountValues, 0);
    fitness -= maxShiftCount - minShiftCount; // Penalize imbalance

    // Penalize violations (e.g., max hours)
    for (const employeeId in employeeShiftCount) {
      const totalHours =
        employeeShiftCount[employeeId] * this.constraints.hoursPerShift;
      if (totalHours > this.constraints.maxHoursPerWeek) {
        fitness -= 10 * (totalHours - this.constraints.maxHoursPerWeek);
      }
    }

    return fitness;
  }

  // Check employee availability for a shift
  isAvailable(employee, shift) {
    return (
      employee.availability.includes(shift.day) &&
      employee.skills.includes(shift.skill)
    );
  }

  // Perform crossover
  crossover(parent1, parent2) {
    const crossoverPoint = Math.floor(Math.random() * this.shifts.length);
    const childSchedule = [
      ...parent1.schedule.slice(0, crossoverPoint),
      ...parent2.schedule.slice(crossoverPoint),
    ];
    return {
      schedule: childSchedule,
      fitness: this.evaluateFitness(childSchedule),
    };
  }

  // Perform mutation
  mutate(individual) {
    const mutatedSchedule = individual.schedule.map((employeeId, index) => {
      if (Math.random() < this.mutationRate) {
        const availableEmployees = this.employees.filter((employee) =>
          this.isAvailable(employee, this.shifts[index])
        );
        return availableEmployees.length
          ? availableEmployees[
              Math.floor(Math.random() * availableEmployees.length)
            ].id
          : null;
      }
      return employeeId;
    });

    return {
      schedule: mutatedSchedule,
      fitness: this.evaluateFitness(mutatedSchedule),
    };
  }

  // Select parents using tournament selection
  selectParents() {
    const tournamentSize = 3;
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndividual =
        this.population[Math.floor(Math.random() * this.population.length)];
      tournament.push(randomIndividual);
    }
    return tournament.sort((a, b) => b.fitness - a.fitness).slice(0, 2); // Top 2
  }

  // Run the algorithm
  run() {
    this.initializePopulation();

    for (let generation = 0; generation < this.maxGenerations; generation++) {
      const newPopulation = [];

      while (newPopulation.length < this.populationSize) {
        const [parent1, parent2] = this.selectParents();
        let child = this.crossover(parent1, parent2);

        if (Math.random() < this.mutationRate) {
          child = this.mutate(child);
        }

        newPopulation.push(child);
      }

      this.population = newPopulation;
      console.log(
        `Generation ${generation + 1} - Best Fitness: ${Math.max(
          ...this.population.map((i) => i.fitness)
        )}`
      );
    }

    return this.population.sort((a, b) => b.fitness - a.fitness)[0];
  }
}

// const ga = new GeneticAlgorithm(10, 0.1, 50, employees3, shifts2, constraints);
// const bestSchedule = ga.run();

// console.log("Best Schedule:", bestSchedule);

class FastFlexibleScheduling {
  constructor(employees, shifts, constraints) {
    this.employees = employees; // List of employees
    this.shifts = shifts; // List of shifts
    this.constraints = constraints; // Constraints like max hours, skill match, and availability
    this.schedule = []; // Final schedule
  }

  // Check if an employee is eligible for a shift
  isEligible(employee, shift) {
    return (
      employee.availability.includes(shift.day) &&
      employee.skills.includes(shift.skill) &&
      this.getTotalHours(employee.id) + this.constraints.hoursPerShift <=
        this.constraints.maxHoursPerWeek
    );
  }

  // Get total hours assigned to an employee
  getTotalHours(employeeId) {
    return (
      this.schedule.filter((entry) => entry.employeeId === employeeId).length *
      this.constraints.hoursPerShift
    );
  }

  // Assign shifts using heuristic rules
  assignShifts() {
    for (const shift of this.shifts) {
      // Get eligible employees for this shift
      const eligibleEmployees = this.employees.filter((employee) =>
        this.isEligible(employee, shift)
      );

      if (eligibleEmployees.length > 0) {
        // Sort eligible employees by least assigned hours (to balance workloads)
        eligibleEmployees.sort(
          (a, b) => this.getTotalHours(a.id) - this.getTotalHours(b.id)
        );

        // Assign the shift to the most suitable employee
        const selectedEmployee = eligibleEmployees[0];
        this.schedule.push({ shift, employeeId: selectedEmployee.id });
      } else {
        // If no eligible employee, mark the shift as unassigned
        this.schedule.push({ shift, employeeId: null });
      }
    }
  }

  // Run the scheduler
  run() {
    this.assignShifts();

    console.log("Final Schedule:");
    for (const entry of this.schedule) {
      const shift = entry.shift;
      const employeeId = entry.employeeId || "Unassigned";
      console.log(
        `Shift: ${shift.day} (${shift.skill}) -> Employee: ${employeeId}`
      );
    }

    return this.schedule;
  }
}

// const ffs = new FastFlexibleScheduling(employees3, shifts, constraints);
// const finalSchedule = ffs.run();

// console.log(finalSchedule);

// class ScheduleTracker {
//   observers = [];

//   addObserver(callback) {
//     this.observers.push(callback);
//   }

//   _notify(event) {
//     this.observers.forEach(cb => cb(event));
//   }
// }

// Helper function to check if we meet the shift requirements
function meetsRequirements(agentGroup, shiftType) {
  const requirements = SHIFT_REQUIREMENTS[shiftType];
  console.log(agentGroup);

  return (
    agentGroup.callAgents >= requirements.callAgents &&
    agentGroup.onlineAgents >= requirements.onlineAgents &&
    agentGroup.supervisors >= requirements.supervisors
  );
}

/**
 * Generate work pattern based on preferred work pattern type
 * Work Pattern Types 5-2, 3-1
 * @param {*} daysInMonth - number of days in the scheduling horizon
 * @param {*} startWorkAt - number of days to start work after
 * @param {*} daysOn - number of days to work
 * @param {*} daysOff - number of days to not work
 * @returns
 */
function generateWorkPattern(
  daysInMonth,
  startWorkAt,
  daysOn = 5,
  daysOff = 2
) {
  if ((daysOn == 5 && daysOff !== 2) || (daysOn !== 5 && daysOff == 2))
    throw Error(
      "Please specify the correct work-dayoff pattern e.i. 5-on, 2-off"
    );
  if ((daysOn == 3 && daysOff !== 1) || (daysOn !== 3 && daysOff == 1))
    throw Error(
      "Please specify the correct work-dayoff pattern e.i. 3-on, 1-off"
    );

  const pattern = [];
  let workDays = 0;
  let offDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    if (day >= startWorkAt) {
      if (workDays < daysOn) {
        pattern.push("Work");
        workDays++;
      } else if (offDays < daysOff) {
        pattern.push("Off");
        offDays++;
        if (offDays === daysOff) {
          workDays = 0;
          offDays = 0;
        }
      }
    } else {
      pattern.push("Off");
      offDays++;
    }
  }

  return pattern;
}

// Assign agents to shifts based on roles and requirements
function assignShifts(agents, daysInMonth, pattern) {
  const schedule = [];
  let employees = [1];
  let shifts = [];
  let schedules = [];
  let workPatternTypes = [3, 5];

  // Initialize agent counts
  const agentCounts = {};

  agents.forEach((agent, i) => {
    let agentSchedule = {};

    agentSchedule["user"] = agent;
    agentSchedule["schedules"] = [];

    agentCounts[agent.id] = {
      callAgents: 0,
      onlineAgents: 0,
      supervisors: 0,
    };

    const workPattern = generateWorkPattern(
      daysInMonth,
      i % 7,
      pattern[0],
      pattern[1]
    );

    // console.log(workPattern)

    workPattern.forEach((status, day) => {
      if (status === "Off") {
        agentSchedule["schedules"].push({
          date: format(new Date().setDate(day + 1), "yyyy-MM-dd"),
          shift: 5,
        });
      } else {
        // Assign shifts based on shift requirements and agent role
        let shiftType;
        if (agent.subgroupId === SUBGROUPS.IC) {
          shiftType = day % 2 === 0 ? SHIFT_TYPES.AM : SHIFT_TYPES.PM;
          if (day % 7 === 0) shiftType = SHIFT_TYPES.NS; // Assign Night Shift twice in a week
          agentCounts[agent.id].supervisors++; // Count as supervisor
        } else if (agent.subgroupId === SUBGROUPS.CALL) {
          shiftType = day % 2 === 0 ? SHIFT_TYPES.MD : SHIFT_TYPES.PM;
          if (day % 7 === 0) shiftType = SHIFT_TYPES.NS; // Assign Night Shift twice in a week
          agentCounts[agent.id].callAgents++; // Count as call agent
        } else if (agent.subgroupId === SUBGROUPS.ONLINE) {
          shiftType = day % 2 === 0 ? SHIFT_TYPES.MD : SHIFT_TYPES.PM;
          if (day % 7 === 0) shiftType = SHIFT_TYPES.NS; // Assign Night Shift twice in a week
          agentCounts[agent.id].onlineAgents++; // Count as online agent
        }

        // Check if we meet the requirements before assigning
        const currentAgentGroup = {
          callAgents: _.countBy(Object.values(agentCounts), "callAgents"),
          onlineAgents: _.countBy(Object.values(agentCounts), "onlineAgents"),
          supervisors: _.countBy(Object.values(agentCounts), "supervisors"),
        };

        // if (meetsRequirements(currentAgentGroup, shiftType)) {
        //     agentSchedule['schedules'].push({ date: format(new Date().setDate(day), "yyyy-MM-dd"), shift: shiftType });
        // } else {
        //     agentSchedule['schedules'].push({ date: format(new Date().setDate(day), "yyyy-MM-dd"), shift: "Unassigned" }); // Mark unassigned if requirements not met
        // }

        agentSchedule["schedules"].push({
          date: format(new Date().setDate(day + 1), "yyyy-MM-dd"),
          shift: shiftType,
        });
      }
    });

    schedule.push(agentSchedule);
  });

  return schedule;
}

module.exports = assignShifts;

// Sample data
const agents2 = [
  { id: 1, role: "callAgent", subgroupId: 2, startWorkAt: 1, pattern: [5, 2] },
  {
    id: 2,
    role: "onlineAgent",
    subgroupId: 3,
    startWorkAt: 2,
    pattern: [3, 1],
  },
  { id: 3, role: "callAgent", subgroupId: 2, startWorkAt: 2, pattern: [5, 2] },
  {
    id: 4,
    role: "onlineAgent",
    subgroupId: 3,
    startWorkAt: 2,
    pattern: [3, 1],
  },
  { id: 5, role: "callAgent", subgroupId: 2, startWorkAt: 2, pattern: [5, 2] },
  { id: 6, role: "2IC", subgroupId: 1, startWorkAt: 2, pattern: [3, 1] },
  { id: 7, role: "2IC", subgroupId: 1, startWorkAt: 1, pattern: [5, 2] },
  { id: 8, role: "callAgent", subgroupId: 2, startWorkAt: 2, pattern: [5, 2] },
  { id: 9, role: "callAgent", subgroupId: 2, startWorkAt: 3, pattern: [5, 2] },
  { id: 10, role: "callAgent", subgroupId: 2, startWorkAt: 4, pattern: [3, 1] },
];

const daysInMonth = getDaysInMonth(new Date());
// Generate the schedule for all agents
// const shiftSchedule = assignShifts(agents, daysInMonth, [3, 1]);
// console.log(shiftSchedule[0]);

async function newAlgo() {
  let employees =
    (await getSchedulesByDate(format(new Date(), "yyyy-MM-dd")).then((s) =>
      s.map((d) => d.employeeId)
    )) ?? [];
  let shifts = [];
  let employeesWithShifts =
    (await getSchedulesByDate(format(new Date(), "yyyy-MM-dd")).then((s) =>
      s.map((d) => d.employeeId)
    )) ?? [];
  let employeesWithoutShifts = employees || []; // by default all employees for the current day do not have a shift assigned to them

  // itirate thru the employees list
  for (let i = 0; i < employees.length; i++) {
    let employee = employees[i];
    // check if the employee is without shift
    if (employeesWithShifts.includes(employee)) {
      console.log(employee + " has a shift");
    }
    if (employeesWithoutShifts.includes(employee)) {
      console.log(employee + " does not have a shift");
    }
  }
}

// newAlgo()

// "consecutiveDaysWorkedRules": [
// {
// "id": "min3Max5ConsecutiveICUDays"
// "minimum": 3,
// "maximum": 5,
// "satisfiability": "REQUIRED",
// "includeShiftTags": [
// "ICU"
// ]
// ]
// shiftWorkedMin
// shiftWorkedMax

const createWorkPattern = (daysInMonth) => {
  if (!daysInMonth || daysInMonth < 28 || daysInMonth > 31)
    throw new Error("Days in months should be between 28 and 31 inclusively.");
  const workPatternTypes = [3, 5];
  const workPattern = [];
  let remainingDays = daysInMonth;
  let currentPatternIndex = 0;

  while (remainingDays > 0) {
    let workDaysLength =
      workPatternTypes[currentPatternIndex % workPatternTypes.length];
    let offDaysLength = workDaysLength == 5 ? 2 : 1;

    if (workDaysLength + offDaysLength > remainingDays) {
      if (remainingDays <= workDaysLength) {
        workDaysLength = remainingDays;
        offDaysLength = 0;
      } else {
        offDaysLength = remainingDays - workDaysLength;
      }
    }

    for (let i = 0; i < workDaysLength; i++) {
      workPattern.push("w");
    }

    for (let i = 0; i < offDaysLength; i++) {
      workPattern.push("o");
    }

    remainingDays -= workDaysLength + offDaysLength;
    currentPatternIndex++;
  }

  return workPattern;
};

// console.log(createWorkPattern(33));

/**
 * Scheduler
 */
class ShiftScheduler {
  schedule = [];
  #dateStart;
  #dateEnd;
  #subgroupId;

  constructor(employees, shifts, maxFatigue = 100) {
    this.employees = employees;
    this.shifts = shifts;
    this.maxFatigue = maxFatigue;

    // Triple-layered index
    this.dateIndex = new Map();  // date → user → shift
    this.userIndex = new Map();  // user → date → shift
    this.shiftIndex = new Map(); // shift → date → users
  }

  /**
   * Generate a 5-on, 2-off schedule
   * @param {*} daysInMonth
   * @param {*} startWorkAt
   * @param {*} daysOn - e.i. 5 days on, 2 days on
   * @param {*} daysOff - 2 days off, e.i. 1 day off
   * @returns work pattern
   */
  createWorkPattern(startWorkAt = 1, daysOn = 5, daysOff = 2) {
    if ((daysOn == 5 && daysOff !== 2) || (daysOn !== 5 && daysOff == 2))
      throw Error(
        "Please specify the correct work-dayoff pattern e.i. 5-on, 2-off"
      );
    if ((daysOn == 3 && daysOff !== 1) || (daysOn !== 3 && daysOff == 1))
      throw Error(
        "Please specify the correct work-dayoff pattern e.i. 3-on, 1-off"
      );

    const dateRanges = getDatesWithinRange(this.#dateStart, this.#dateEnd);
    const daysInMonth = dateRanges.length;

    const pattern = [];
    let workDays = 0;
    let offDays = 0;

    for (let day = 0; day <= daysInMonth; day++) {
      if (day < startWorkAt) {
        pattern.push("Off");
        offDays++;
      } else {
        if (workDays < daysOn) {
          pattern.push("Work");
          workDays++;
        } else if (offDays < daysOff) {
          pattern.push("Off");
          offDays++;
          if (offDays === daysOff) {
            workDays = 0;
            offDays = 0;
          }
        }
      }
    }

    return pattern;
  }

  assignDatesToWorkPattern(workPattern, dateRanges) {
    if (workPattern.length < 0) {
      return [];
    }
    let schedule = [];

    workPattern.forEach((pattern, day) => {
      schedule.push({ date: dateRanges[day], shift: pattern });
    });

    return schedule;
  }

  assignDatesToWorkPattern = (workPatterns) => {
    let shifts = [];
    let today = new Date();

    for (let i = 0; i < workPatterns.length; i++) {
      shifts.push({
        shift: workPatterns[i],
        date: addDays(today, i),
      });
    }

    return shifts;
  };

  assignShiftsToDates = (shifts) => {
    let schedule = [];

    // for (let i = 0; i < shifts.length; i++) {
    //   if (shifts[i].shift === 'w') {
    //     shifts[i].shift = 'AM';
    //     // shifts[i] = 'PM';
    //     // shifts[i] = 'NS';
    //   }
    //   else {
    //     shifts[i].shift = 'OFF';
    //   }
    // }

    return shifts;
  };

  optimizeSchedule(schedule) {}

  run() {
    for (let employee of this.employees) {
      let pattern = createWorkPattern(daysInMonth);
      let shifts = this.assignDatesToWorkPattern(pattern);
      let schedules = this.assignShiftsToDates(shifts);

      this.schedule.push({
        employee,
        schedules,
      });
    }
  }

  createMatrix() {
    let matrix = [];
    const shiftMap = {
      w: 1,
      o: 0,
      // '6am': 1,
      // '8am': 2,
      // '2pm': 3,
      // '11pm': 4
      // 'off': 0
    };
    for (let i = 0; i < this.schedule.length; i++) {
      let row = [];
      for (let j = 0; j < this.schedule[i].schedules.length; j++) {
        row.push(this.schedule[i].schedules[j].shift == "w" ? 1 : 0);
      }
      matrix.push(row);
    }

    console.log("Before swap:");
    console.table(matrix);

    this.swapShifts(matrix, 0, 1, 0);

    console.log("After swap:");
    console.table(matrix);

    return matrix;
  }

  swapShifts(matrix, employee1, employee2, shiftIndex) {
    // Swap the values at the specified shift index for the two employees
    let temp = matrix[employee1][shiftIndex];
    matrix[employee1][shiftIndex] = matrix[employee2][shiftIndex];
    matrix[employee2][shiftIndex] = temp;
  }

  computePatternUsingPCA() {
    let schedule = createWorkPattern(31);
    let matrix = this.createMatrix();

    // const A = mathFn.matrix(matrix);

    // // LU Decomposition
    // const LU = mathFn.lup(A);  // LU is an object containing L, U, and pivot indices

    // console.log('L:', LU.L);
    // console.log('U:', LU.U);
    // console.log('P:', LU.p);  // Pivot matrix

    // // QR Decomposition
    // const QR = mathFn.qr(A);  // QR is an object containing Q and R

    // console.log('Q:', QR.Q);
    // console.log('R:', QR.R);

    // Perform SVD on the shift matrix
    // const svdResult = numericFn.svd(matrix);

    // // Extract U, Sigma, and V^T matrices
    // const U = svdResult.U;
    // const S = svdResult.S;
    // const Vt = svdResult.V;

    // // Display the decomposed matrices
    // console.log('U (Employee Factors):', U[0]);
    // console.log('Sigma (Singular Values):', S);
    // console.log('V^T (Day Factors):', Vt[0]);

    // // You can reconstruct the matrix by multiplying U, S, and Vt
    // const reconstructedMatrix = numericFn.dotMMbig(U, numericFn.diag(U, S), Vt);
    // console.log('Reconstructed Shift Matrix:', reconstructedMatrix);

    // Perform PCA on the shift matrix
    // Step 2: Center the data by subtracting the mean of each column
    const columnMeans = numericFn
      .dim(matrix)
      .map(
        (_, i) => numericFn.sum(matrix.map((row) => row[i])) / matrix.length
      );

    const centeredData = matrix.map((row) =>
      row.map((value, idx) => value - columnMeans[idx])
    );

    console.log(matrix);

    // // Step 3: Compute the covariance matrix
    // const covarianceMatrix = numericFn.dotMMbig(numericFn.transpose(centeredData), centeredData);
    // const covarianceMatrixNormalized = covarianceMatrix.map(row =>
    //   row.map(value => value / (matrix.length - 1))
    // );

    // // Step 4: Compute the eigenvalues and eigenvectors (this step uses `numericFn.eig`)
    // const eigResult = numericFn.eig(covarianceMatrixNormalized);

    // // Step 5: Sort the eigenvectors by eigenvalues
    // const eigenvalues = eigResult.lambda; // Eigenvalues
    // const eigenvectors = eigResult.E; // Eigenvectors

    // // Sort the eigenvectors by the corresponding eigenvalues in descending order
    // const sortedIndices = eigenvalues.map((value, idx) => idx).sort((a, b) => eigenvalues[b] - eigenvalues[a]);
    // const sortedEigenvectors = sortedIndices.map(idx => eigenvectors[idx]);
    // const sortedEigenvalues = sortedIndices.map(idx => eigenvalues[idx]);

    // // Step 6: Project the data onto the principal components (the eigenvectors)
    // const projectedData = numericFn.dotMMbig(centeredData, numericFn.transpose(sortedEigenvectors));

    // Step 7: Output results
    // console.log("Covariance Matrix:", covarianceMatrixNormalized);
    // console.log("Eigenvalues (Variance Explained by Each Principal Component):", sortedEigenvalues);
    // console.log("Top Eigenvectors (Principal Components):", sortedEigenvectors);

    // // The projected data is the representation of the original data in the new principal component space
    // console.log("Projected Data onto Principal Components:", projectedData);
  }

  // Function to predict the next shift based on previous patterns
  predictNextShift(matrix) {
    let predictedShifts = [];

    // Iterate over each employee's shift data
    matrix.forEach((employeeShifts) => {
      let shiftPattern = employeeShifts.slice(-3); // Get the last 3 shifts (a repeating cycle)
      let nextShift;

      // Predict the next shift based on the repeating pattern
      if (shiftPattern.length === 3) {
        // Check if the pattern is cyclic and predict the next shift
        if (
          shiftPattern[0] === "M" &&
          shiftPattern[1] === "E" &&
          shiftPattern[2] === "N"
        ) {
          nextShift = "M"; // Cycle: M -> E -> N -> M
        } else if (
          shiftPattern[0] === "N" &&
          shiftPattern[1] === "M" &&
          shiftPattern[2] === "E"
        ) {
          nextShift = "N"; // Cycle: N -> M -> E -> N
        } else if (
          shiftPattern[0] === "E" &&
          shiftPattern[1] === "N" &&
          shiftPattern[2] === "M"
        ) {
          nextShift = "E"; // Cycle: E -> N -> M -> E
        }
      }

      // Store the predicted shift for the employee
      predictedShifts.push(nextShift);
    });

    return predictedShifts;
  }

  // Convert shift names into numerical values
  shiftToNumber = (shift) => {
    switch (shift) {
      case "off":
        return 0;
      case "6am":
        return 1;
      case "8am":
        return 2;
      case "2pm":
        return 3;
      case "11pm":
        return 5; // NS
      default:
        return -1; // Invalid shift
    }
  };

  numberToShift = (number) => {
    switch (number) {
      case 0:
        return "off";
      case 1:
        return "6am";
      case 2:
        return "8am";
      case 3:
        return "2pm";
      case 3:
        return "11pm";
      default:
        return "Invalid"; // Invalid shift
    }
  };

  // Function to predict the next shift based on previous patterns
  predictNextShift2(shiftData) {
    // let matrix = this.createMatrix();
    // Initialize the neural network
    const net = new brainjs.NeuralNetwork();

    // net.train([{input: [0, 0], output: [0]},
    //            {input: [0, 1], output: [1]},
    //            {input: [1, 0], output: [1]},
    //            {input: [1, 1], output: [0]}]);

    // let output = net.run([1, 0]);
    // console.log(output);

    const inputData = shiftData.map((employeeShifts) =>
      employeeShifts.map(this.shiftToNumber)
    );

    // Prepare training data: We use the last shift as the input and the next shift as the output
    const trainingData = [];
    for (let i = 0; i < inputData.length; i++) {
      for (let j = 0; j < inputData[i].length - 1; j++) {
        // Predict the next shift for each employee
        trainingData.push({
          input: [inputData[i][j]], // Current shift
          output: [inputData[i][j + 1]], // Next shift
        });
      }
    }

    // Train the network with the prepared data
    net.train(trainingData);

    // Example predictions: predicting the next shift for each employee
    const predictions = shiftData.map((employeeShifts) => {
      // Get the last shift for the employee
      const lastShift = employeeShifts[employeeShifts.length - 1];

      // Make the prediction using the trained network
      const output = net.run([this.shiftToNumber(lastShift)]);

      // Convert the predicted number back to the shift name
      const predictedShift = this.numberToShift(Math.round(output[0]));

      return predictedShift;
    });

    console.log("Predicted next shifts:", predictions);
  }

  getSchedulesByDate() {
    let filteredResult = {};
    this.schedule.forEach((s) => {
      let d = s.schedules.filter(
        (s) => format(s.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
      );
      filteredResult[s.employee.id] = d[0];
    });
    return filteredResult;
  }

  calculateFatigue(employee, shift) {
    // Basic fatigue model: fatigue grows with shift hours
    return shift.hours * shift.fatigueFactor;
  }

  assignShifts() {
    for (let day = 0; day < 7; day++) {
      this.employees.forEach((employee) => {
        if (employee.preferences.includes(day)) {
          employee.schedule[day] = "Day Off"; // Respect day-off preferences
        } else {
          let availableShifts = this.shifts.filter((shift) => {
            const fatigue = this.calculateFatigue(employee, shift);
            return employee.fatigue + fatigue <= this.maxFatigue;
          });

          if (availableShifts.length > 0) {
            let chosenShift = availableShifts[0]; // Simple heuristic: choose the first available shift
            employee.schedule[day] = chosenShift.id;
            employee.fatigue += this.calculateFatigue(employee, chosenShift);
          } else {
            employee.schedule[day] = "Rest"; // No suitable shift, assign rest
          }
        }
      });
    }
  }

  printSchedules() {
    this.employees.forEach((employee) => {
      console.log(`Schedule for ${employee.name}:`);
      console.log(employee.schedule.join(", "));
      console.log(`Final Fatigue: ${employee.fatigue}\n`);
    });
  }

  runVerticalSearch() {
    let matrix = [];

    for (let employee of this.employees) {
      let pattern = createWorkPattern(daysInMonth);
      let shifts = this.assignDatesToWorkPattern(pattern);

      matrix.push({
        employee,
        shifts,
      });
    }

    // Perform vertical search
    // for (let i = 0; i < matrix.length; i++) {

    //   for (let j = 0; j < ) {

    //   }
    // }

    console.log(matrix[0]);
  }

  assign(userId, date, shiftId) {
    // Update all indexes
    this._updateDateIndex(date, userId, shiftId);
    this._updateUserIndex(userId, date, shiftId);
    this._updateShiftIndex(shiftId, date, userId);
  }

  getSchedule(userId) {
    return this.userIndex.get(userId) || new Map();
  }

  getWorkers(date, shiftId) {
    return this.shiftIndex.get(shiftId)?.get(date) || new Set();
  }

  _updateDateIndex(date, userId, shiftId) {
    if (!this.dateIndex.has(date)) {
      this.dateIndex.set(date, new Map());
    }
    this.dateIndex.get(date).set(userId, shiftId);
  }
}

// let shift = ['w','w','o','w','o','w','w'];
// let offShiftToLastIdx = shift.lastIndexOf('o');
// let offShiftToLastDist = shift.length - offShiftToLastIdx;
// let splitShifts = shift.slice(offShiftToLastIdx+1, shift.length);
// let rightShiftsCount = offShiftToLastDist-1;
// let leftShiftsCount = offShiftToLastIdx+1;

// if (rightShiftsCount == 3 && leftShiftsCount == 3 && offDaysCount === 1) shiftPatternType = '5/2';
// if (rightShiftsCount == 3 && leftShiftsCount == 3 && offDaysCount === 1) shiftPatternType = '3/1';

// const serializeData = (data) => JSON.parse(JSON.stringify(data, null, 2));
exports.ShiftScheduler = ShiftScheduler;

const scheduler = new ShiftScheduler(employees, shifts4);
// scheduler.assignShifts();
// scheduler.printSchedules();
// scheduler.run();
// scheduler.getSchedulesByDate();
// scheduler.createMatrix();
// scheduler.computePatternUsingPCA();

// Example shift matrix (last column is the predicted column)
let shiftData = [
  ["M", "E", "N"], // Employee 1
  ["N", "M", "E"], // Employee 2
  ["E", "N", "M"], // Employee 3
  ["M", "N", "E"],
  ["M", "N", "E"],
];

// Predict next shifts (Day 4)
// let predictions = scheduler.predictNextShift(shiftData);
// console.log("Predicted shifts for Day 4:", predictions);
// scheduler.predictNextShift2(shiftData)
// scheduler.runVerticalSearch();

class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class CircularLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /**
   * This function insert a node into the circular linked-list
   * @param {*} value
   */
  insert(value) {
    if (this.tail !== null) {
      return this.tail;
    }

    let newNode = new Node(value);
    newNode.next = newNode;

    this.tail = newNode;
    return this.tail;
  }

  /**
   * This function insert a node at the beginning of a circular linked-list
   * @param {*} data
   */
  insertAtBeginning(data) {
    let newNode = new Node(data);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      newNode.next = this.head;
    } else {
      newNode.next = this.head;
      this.head = newNode;
      this.tail.next = this.head;
    }

    this.size++;
  }

  /**
   * This function insert a node at the end of a circular linked-list
   * @param {*} data
   */
  insertAtEnd(data) {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      newNode.next = this.head;
    } else {
      this.tail.next = newNode;
      newNode.next = this.head;
      this.tail = newNode;
    }
    this.size++;
  }

  insertAtPosition(data, pos) {
    if (this.tail === null) {
      // If the list is empty
      if (pos !== 1) {
        console.log("Invalid position!");
        return this.tail;
      }
      // Create a new node and make it point to itself
      let newNode = new Node(data);
      this.tail = newNode;
      this.tail.next = this.tail;
      return this.tail;
    }

    // Create a new node with the given data
    let newNode = new Node(data);

    // curr will point to head initially
    let curr = this.tail.next;

    if (pos === 1) {
      // Insert at the beginning
      newNode.next = curr;
      this.tail.next = newNode;
      return this.tail;
    }

    // Traverse the list to find the insertion point
    for (let i = 1; i < pos - 1; ++i) {
      curr = curr.next;

      // If position is out of bounds
      if (curr === this.tail.next) {
        console.log("Invalid position!");
        return this.tail;
      }
    }

    // Insert the new node at the desired position
    newNode.next = curr.next;
    curr.next = newNode;

    // Update last if the new node is inserted at the end
    if (curr === this.tail) {
      this.tail = newNode;
    }

    return this.tail;
  }

  deleteFirstNode() {
    if (this.tail === null) {
      // If the list is empty
      console.log("List is empty");
      return null;
    }

    let head = this.tail.next;

    if (head === this.tail) {
      // If there is only one node in the list
      this.tail = null;
    } else {
      // More than one node in the list
      this.tail.next = head.next;
    }

    return this.tail;
  }

  deleteSpecificNode(key) {
    if (this.tail === null) {
      // If the list is empty
      console.log("List is empty, nothing to delete.");
      return null;
    }

    let curr = this.tail.next;
    let prev = this.tail;

    // If the node to be deleted is the only node in the list
    if (curr === this.tail && curr.data === key) {
      this.tail = null;
      return this.tail;
    }

    // If the node to be deleted is the first node
    if (curr.data === key) {
      this.tail.next = curr.next;
      return this.tail;
    }

    // Traverse the list to find the node to be deleted
    while (curr !== this.tail && curr.data !== key) {
      prev = curr;
      curr = curr.next;
    }

    // If the node to be deleted is found
    if (curr.data === key) {
      prev.next = curr.next;
      if (curr === this.tail) {
        this.tail = prev;
      }
    } else {
      // If the node to be deleted is not found
      console.log("Node with data " + key + " not found.");
    }

    return this.tail;
  }

  deleteLastNode() {
    if (this.tail === null) {
      // If the list is empty
      console.log("List is empty, nothing to delete.");
      return null;
    }
    let head = this.tail.next;

    // If there is only one node in the list
    if (head === this.tail) {
      this.tail = null;
      return this.tail;
    }
    // Traverse the list to find the second last node
    let curr = head;
    while (curr.next !== this.tail) {
      curr = curr.next;
    }
    // Update the second last node's next pointer to point to head
    curr.next = head;
    this.tail = curr;

    return this.tail;
  }

  deleteNode(data) {
    if (!this.head) return false;
    if (this.head.data === data) {
      if (this.size === 1) {
        this.head = null;
        this.tail = null;
      } else {
        this.head = this.head.next;
        this.tail.next = this.head;
      }
      this.size--;
      return true;
    }
    let current = this.head;
    let prev = null;
    do {
      if (current.next.data === data) {
        if (current.next === this.tail) {
          this.tail = current;
        }
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    } while (current !== this.head);
    return false; // Node not found
  }

  search(key) {
    if (this.tail === null) {
      // If the list is empty
      return false;
    }

    let head = this.tail.next;
    let curr = head;

    // Traverse the list to find the key
    while (curr !== this.tail) {
      if (curr.data === key) {
        // Key found
        return true;
      }
      curr = curr.next;
    }

    // Check the last node
    if (this.tail.data === key) {
      // Key found
      return true;
    }
    // Key not found
    return false;
  }

  traverse() {
    if (!this.head) return;
    let current = this.head;

    do {
      console.log(current.data);
      current = current.next;
    } while (current !== this.head);
  }

  toArray() {
    if (!this.head) return;
    let current = this.head;
    let arr = [];

    do {
      arr.push(current.data);
      current = current.next;
    } while (current !== this.head);

    return arr;
  }

  printList() {
    if (this.tail === null) {
      return;
    }

    let head = this.tail.next;
    while (true) {
      console.log(head.data + " ");
      head = head.next;
      if (head === this.tail.next) {
        break;
      }
    }
    console.log();
  }
}
exports.CircularLinkedList = CircularLinkedList;

// let llist = new CircularLinkedList();
// //// AM->AM->AM->OFF
// //// AM->AM->PM->OFF
// //// AM->AM->N->OFF
// //// PM->PM->N->OFF
// //// PM->PM->AM->OFF
// //// PM->PM->PM->OFF
// llist.insertAtEnd("AM");
// llist.insertAtEnd("PM");
// llist.insertAtEnd("N");
// llist.insertAtEnd("OFF");
// llist.printList();
// console.log(llist.toArray());

class MarkovChain {
  states = ["AM", "PM", "N"];

  // Transition matrix
  A = [
    [0.6, 0.4, 0.0],
    [0.3, 0.5, 0.2],
    [0.1, 0.2, 0.2],
  ];

  constructor(n) {
    this.n = n;
    this.checkMarkov(this.A);
  }

  checkMarkov(m) {
    for (let i = 0; i < this.n; i++) {
      let sum = 0;
      for (let j = 0; j < this.n; j++) {
        sum = sum + m[i][j];
      }
      if (sum != 1) {
        return false;
      }
    }
    return true;
  }
}

// let markov = new MarkovChain();
// console.log(markov.checkMarkov());

function createMatrix(m, n) {
  let M = [];

  for (let i = 0; i < m; i++) {
    let row = [];

    for (let j = 0; j < n; j++) {
      row.push("o");
    }

    M.push(row);
  }

  return M;
}

function mapToMatrix(workPattern) {
  if (!Array.isArray(workPattern[0])) workPattern = [workPattern];
  let matrix = [];

  for (let i = 0; i < workPattern.length; i++) {
    let row = [];
    for (let j = 0; j < workPattern[i].length; j++) {
      row.push(workPattern[i][j] === "w" ? 1 : 0);
    }
    matrix.push(row);
  }

  return matrix;
}

function transformToWeekly(arr) {
  let matrix = [];
  let row = [];

  for (let i = 0; i < arr.length; i++) {
    row.push(arr[i]);
    if ((i + 1) % 7 === 0) {
      matrix.push(row);
      row = [];
    }
  }

  return matrix;
}

/**
 * count elements in given column
 * @param {Array} matrix
 * @param {number} colIdx
 * @returns
 */
function countColumn(matrix, colIdx) {
  // if (!(colIdx < 0 || colIdx > matrix[0].length)) throw new Error("colIdx must within the length of matrix");

  let count = {
    totalCount: 0,
    offCount: 0,
    onCount: 0,
  };

  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i][colIdx] === "o") {
      count.offCount++;
    }
    if (matrix[i][colIdx] === "w") {
      count.onCount++;
    }
  }

  return count;
}

/**
 * count elements in given row
 * @param {Array} matrix
 * @param {number} rowIdx
 * @returns
 */
function countRow(matrix, rowIdx) {
  // if (rowIdx > matrix.length || rowIdx < matrix.length) throw new Error("rowIdx must within the length of matrix")

  let count = {
    totalCount: 0,
    offCount: 0,
    onCount: 0,
  };

  for (let i = 0; i < matrix[rowIdx].length; i++) {
    if (matrix[rowIdx][i] === "o") {
      count.offCount++;
    }
    if (matrix[rowIdx][i] === "w") {
      count.onCount++;
    }
  }

  return count;
}
// let A = createMatrix(5, 5);
// console.log(A)
// console.log(countColumn(A, 0))
// console.log(countRow(A, 2))

function verifyShifts(matrix, maxAgentPerDay) {
  let shifts = [];

  for (let i = 0; i < matrix.length; i++) {
    let employeesAssigned = 0;

    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] == "off") {
        shifts.push(0);
        employeesAssigned++;
      } else {
        shifts.push(40);
      }
    }

    if (employeesAssigned > maxAgentPerDay) {
      console.log(
        `Error: More than ${maxAgentPerDay} employees assigned on day ${i + 1}.`
      );
      return false;
    }
  }

  // return shifts.reduce((a, b) => a + b, 0) < 40;
  console.log("All shift assignments are valid.");
  return true;
}

function verifyWorkHoursPerWeek(matrix, agentIdx, maxHoursPerWeek = 40) {
  let shifts = [];

  let hoursWorked = 0;

  for (let j = 0; j < matrix[agentIdx].length; j++) {
    if (matrix[agentIdx][j] == "off") {
      shifts.push(0);
      hoursWorked++;
    } else {
      shifts.push(40);
    }
  }

  if (hoursWorked > maxHoursPerWeek) {
    console.log(
      `Error: More than ${maxHoursPerWeek} employees assigned on day ${i + 1}.`
    );
    return false;
  }

  // return shifts.reduce((a, b) => a + b, 0) < 40;
  console.log("All shift assignments are valid.");
  return true;
}

// let daysTotal = getDaysInMonth(new Date());
// let empTotal = 10;
// let today = new Date();
// let day = getDay(today); // relative to week
// let date = getDate(today); // relative to month

// let mySchedules = [];
// for (let i = 0; i < empTotal; i++) {
//   let wp = createWorkPattern(daysTotal);
//   mySchedules.push(wp);
// }
// // let matrix = mapToMatrix(mySchedules);
// let matrix = mySchedules;

// // let matrix = createMatrix(10, 31);
// console.log(countColumn(matrix, date), countRow(matrix, 5))
// console.log(verifyShifts(matrix, 11));
// console.log(verifyWorkHoursPerWeek(matrix, 2, 40));

function calculateMarkovState(transitionMatrix, initialState, steps) {
  // Function to multiply two matrices
  function matrixMultiply(A, B) {
    const result = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < B[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < A[0].length; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  // Function to raise a matrix to a power
  function matrixPower(matrix, power) {
    let result = matrix;
    for (let i = 1; i < power; i++) {
      result = matrixMultiply(result, matrix);
    }
    return result;
  }

  // Calculate the state probabilities at the given time
  const transitionMatrixPower = matrixPower(transitionMatrix, steps);
  const stateProbabilities = matrixMultiply(
    [initialState],
    transitionMatrixPower
  )[0];

  return stateProbabilities;
}

let shiftTypes = ["6AM", "8AM", "2PM", "11PM", "OFF"];

let transitionMatrix = [
  [0.0, 0.8, 0.0, 0.0, 0.2], // 6AM
  [0.0, 0.0, 0.9, 0.0, 0.1], // 8AM
  [0.0, 0.0, 0.0, 0.8, 0.2], // 2PM
  [0.0, 0.0, 0.0, 0.5, 0.5], // 11PM
  [0.5, 0.0, 0.0, 0.0, 0.5], // OFF
];

// const initialState = [0.50, 0.20, 0.15, 0.20, 0.00];
// const steps = 10; // Calculate probabilities after 2 steps
// const stateProbabilities = calculateMarkovState(transitionMatrix, initialState, steps);
// console.log("State Probabilities:", stateProbabilities);

// function selectNextShift(stateProbabilities) {
//   const cumulativeProbabilities = stateProbabilities.reduce((acc, current, index) => {
//     acc.push((acc[index - 1] || 0) + current);
//     return acc;
//   }, []);

//   const random = Math.random();
//   for (let i = 0; i < cumulativeProbabilities.length; i++) {
//     if (random <= cumulativeProbabilities[i]) {
//       return shiftTypes[i];
//     }
//   }

//   return shiftTypes[cumulativeProbabilities.length - 1];
// }

// const nextState = selectNextShift(stateProbabilities);
// console.log("Next Shift:", nextState);

// function calculateBrierScore(predictedProbabilities, actualOutcomes) {
//   if (predictedProbabilities.length !== actualOutcomes.length) {
//       throw new Error("Predicted probabilities and actual outcomes must have the same length.");
//   }

//   let brierScore = 0;
//   for (let i = 0; i < predictedProbabilities.length; i++) {
//       const error = (predictedProbabilities[i] - actualOutcomes[i]) ** 2;
//       brierScore += error;
//   }

//   return brierScore / predictedProbabilities.length;
// }

// const predictedProbabilities = [0.7, 0.3, 0.9, 0.1]; // Predicted probabilities for each state
// const actualOutcomes = [1, 0, 1, 0]; // Actual outcomes (1 for occurrence, 0 for non-occurrence)
// const brierScore = calculateBrierScore(predictedProbabilities, actualOutcomes);
// console.log("Brier Score:", brierScore);

// const mySchedules = new HashMap();
// Simplified schema
const Schedule3 = {
  // users: Map<userId, User>,
  // shifts: Map<shiftId, Shift>,
  // assignments: Map<date, Map<userId, shiftId>>,
  // // Indexes for fast lookups
  // userAssignments: Map<userId, Map<date, shiftId>>,
  // shiftCoverage: Map<date, Map<shiftId, Set<userId>>>
};

// const dateIndex = new Map({
//   ['2022-01-01']: new Map([
//     [1, '6AM'],
//     [2, '8AM'],
//     [3, '2PM'],
//     [4, '11PM'],
//     [5, 'OFF']
//   ]),
//   ['2022-01-02']: new Map([
//     [1, '6AM'],
//     [2, '8AM'],
//     [3, '2PM'],
//     [4, '11PM'],
//     [5, 'OFF']
//   ]),
// });

// const userIndex = new Map([
//   [1, new Map([
//     ['2022-01-01', '6AM'],
//     ['2022-01-02', '8AM']
//   ])],
//   [2, new Map([
//     ['2022-01-01', '8AM'],
//     ['2022-01-02', '2PM']
//   ])]
// ]);

// class Assignment {
//   constructor(userId, date, shiftId) {
//     Object.freeze({
//       userId: Object.freeze(userId),
//       date: Object.freeze(date),
//       shiftId: Object.freeze(shiftId)
//     });
//   }
// }

// Check if user has AM shift on 2023-08-01:
// const userShift = getUserShift(userId, '2023-08-01');
// const hasAM = (userShift & SHIFTS.AM) !== 0;

// // Rows = Users, Columns = Dates
// const scheduleMatrix = [
//   // 2023-08-01  2023-08-02
//   [ 'AM',        'OFF' ],  // User1
//   [ 'PM',        'NIGHT' ] // User2
// ];

// const dateShifts = new Map();
// function assignShift(userId, date, shift) {
//   if (!dateShifts.has(date)) {
//     dateShifts.set(date, new Set());
//   }

//   if (dateShifts.get(date).has(shift)) {
//     throw new ConflictError(`Shift ${shift} on ${date} is full`);
//   }

//   dateShifts.get(date).add(shift);
// }

// class ShiftIntervalTree {
//   insert(userId, start, end, shift) {
//     // Store as [startTime, endTime, userId, shift]
//   }

//   checkOverlaps(userId, newStart, newEnd) {
//     // Return conflicting shifts
//   }
// }

// const scheduleHistory = [
//   {
//     timestamp: 1690848000,
//     state: Immutable.Map(assignments)
//   },
//   // Previous versions
// ];

const shiftsToPatternMap = (shiftId) => {
  switch (shiftId) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 7:
      return "w";
    case 5:
      return "o";
    default:
      return "o";
  }
};

function calculatePhaseOffset(lastDayIndex, patternType) {
  const cycleDays = patternType == "5/2" ? 7 : 4;
  return (lastDayIndex + 1) % cycleDays;
}

class UserScheduleState {
  constructor() {
    this.currentPattern = "5/2"; // or '3/1'
    this.daysWorkedInCurrentCycle = 0;
    this.lastShiftType = "AM"; // AM/PM/N
    this.remainingRestDays = 0;
  }

  getNextAssignment(date) {
    if (this.remainingRestDays > 0) {
      this.remainingRestDays--;
      return { type: "OFF", shift: null };
    }

    if (this.daysWorkedInCurrentCycle < this.patternWorkDays) {
      const shift = this.lastShiftType === "AM" ? "PM" : "AM";
      this.daysWorkedInCurrentCycle++;
      return { type: shift, shift: this.getShiftId(shift) };
    }

    // Pattern completed, reset
    this.remainingRestDays = this.patternRestDays;
    this.daysWorkedInCurrentCycle = 0;
    return this.getNextAssignment(date);
  }
}

// Helper functions
function canAssignFiveDay(currentDay, totalDays) {
  return currentDay + 7 <= totalDays; // 5 working + 2 off
}

function calculateWorkHoursPerWeek(shifts) {
  let totalHours = shifts.reduce(
    (total, shift) => total + SHIFTS_MAX_HOURS[shift.shift],
    0
  );
  console.log(totalHours);
  return totalHours;
}

function calculateWorkHoursPerMonth(shifts) {
  const weeklyShifts = groupByWeek(shifts);
  const totalHours = weeklyShifts.reduce(
    (total, week) => total + calculateWorkHoursPerWeek(week),
    0
  );
  return totalHours;
}

function checkMaxHoursPerWeek(shifts) {
  const weeklyShifts = groupByWeek(shifts);
  let totalHours = 0;
  // sum weekly hours
  for (let i = 0; i < weeklyShifts.length; i++) {
    totalHours += calculateWorkHoursPerWeek(weeklyShifts[i]);
  }
}

// Selected three-day patterns
//// AM->AM->AM->OFF
//// AM->AM->PM->OFF
//// AM->AM->N->OFF
//// PM->PM->N->OFF
//// PM->PM->AM->OFF
//// PM->PM->PM->OFF
function validateThreeDayPattern(assignShifts) {
  if (assignShifts.length !== 4) return false;

  if (assignShifts[0] == "AM") {
    if (assignShifts[1] == "AM") {
      // AM->AM->AM->OFF
      // ['AM', 'AM', 'AM', 'DAY Off']
      if (assignShifts[2] == "AM") {
        if (assignShifts[3] == "DAY Off") {
          return ["AM", "AM", "AM", "DAY Off"];
        }
      }
      // AM->AM->PM->OFF
      // ['AM', 'AM', 'PM', 'DAY Off']
      if (assignShifts[2] == "PM") {
        if (assignShifts[3] == "DAY Off") {
          return ["AM", "AM", "PM", "DAY Off"];
        }
      }
      // AM->AM->N->OFF
      // ['AM', 'AM', 'N', 'DAY Off']
      if (assignShifts[2] == "N") {
        if (assignShifts[3] == "DAY Off") {
          return ["AM", "AM", "N", "DAY Off"];
        }
      }
    }
  }

  if (assignShifts[0] == "PM") {
    if (assignShifts[1] == "PM") {
      // PM->PM->N->OFF
      // ['PM', 'PM', 'N', 'DAY Off']
      if (assignShifts[2] == "N") {
        if (assignShifts[3] == "DAY Off") {
          return ["PM", "PM", "N", "DAY Off"];
        }
      }
      // PM->PM->AM->OFF
      // ['PM', 'PM', 'AM', 'DAY Off']
      if (assignShifts[2] == "AM") {
        if (assignShifts[3] == "DAY Off") {
          return ["PM", "PM", "AM", "DAY Off"];
        }
      }
      // PM->PM->PM->OFF
      // ['PM', 'PM', 'PM', 'DAY Off']
      if (assignShifts[2] == "PM") {
        if (assignShifts[3] == "DAY Off") {
          return ["PM", "PM", "PM", "DAY Off"];
        }
      }
    }
  }

  return false;
}

// Selected five-day patterns
//// AM->AM->AM->AM->AM->OFF->OFF
//// AM->AM->PM->PM->PM->OFF->OFF
//// AM->AM->AM->PM->PM->OFF->OFF
//// AM->AM->AM->N->N->OFF->OFF
//// PM->PM->PM->N->N->OFF->OFF
//// PM->PM->PM->PM->PM->OFF->OFF
// AM->AM->PM->PM->NS->OFF->OFF
function validateFiveDayPattern(assignShifts) {
  if (assignShifts.length !== 7) return false;

  if (assignShifts[0] == "AM") {
    if (assignShifts[1] == "AM") {
      // AM->AM->AM->AM->AM->OFF->OFF
      // ['AM', 'AM', 'AM', 'AM', 'AM', 'DAY Off', 'DAY Off']
      if (assignShifts[2] == "AM") {
        if (assignShifts[3] == "AM") {
          if (assignShifts[4] == "AM") {
            if (assignShifts[5] == "DAY Off") {
              if (assignShifts[6] == "DAY Off") {
                return ["AM", "AM", "AM", "AM", "AM", "DAY Off", "DAY Off"];
              }
            }
          }
        }
      }
      // AM->AM->AM->N->N->OFF->OFF
      // ['AM', 'AM', 'AM', 'N', 'N', 'DAY Off', 'DAY Off']
      if (assignShifts[2] == "AM") {
        if (assignShifts[3] == "N") {
          if (assignShifts[4] == "N") {
            if (assignShifts[5] == "DAY Off") {
              if (assignShifts[6] == "DAY Off") {
                return ["AM", "AM", "AM", "N", "N", "DAY Off", "DAY Off"];
              }
            }
          }
        }
      }
      // AM->AM->AM->PM->PM->OFF->OFF
      // ['AM', 'AM', 'AM', 'PM', 'PM', 'DAY Off', 'DAY Off']
      if (assignShifts[2] == "AM") {
        if (assignShifts[3] == "PM") {
          if (assignShifts[4] == "PM") {
            if (assignShifts[5] == "DAY Off") {
              if (assignShifts[6] == "DAY Off") {
                return ["AM", "AM", "AM", "PM", "PM", "DAY Off", "DAY Off"];
              }
            }
          }
        }
      }
      // AM->AM->PM->PM->PM->OFF->OFF
      // ['AM', 'AM', 'PM', 'PM', 'PM', 'DAY Off', 'DAY Off']
      if (assignShifts[2] == "PM") {
        if (assignShifts[3] == "PM") {
          // AM->AM->PM->PM->PM->OFF->OFF
          // ['AM', 'AM', 'PM', 'PM', 'PM', 'DAY Off', 'DAY Off']
          if (assignShifts[4] == "PM") {
            if (assignShifts[5] == "DAY Off") {
              if (assignShifts[6] == "DAY Off") {
                return ["AM", "AM", "PM", "PM", "PM", "DAY Off", "DAY Off"];
              }
            }
          }

          // AM->AM->PM->PM->NS->OFF->OFF
          // ['AM', 'AM', 'PM', 'PM', 'N', 'DAY Off', 'DAY Off']
          if (assignShifts[4] == "N") {
            if (assignShifts[5] == "DAY Off") {
              if (assignShifts[6] == "DAY Off") {
                return ["AM", "AM", "PM", "PM", "N", "DAY Off", "DAY Off"];
              }
            }
          }
        }
      }
    }
  }

  if (assignShifts[0] == "PM") {
    if (assignShifts[1] == "PM") {
      if (assignShifts[2] == "PM") {
        // PM->PM->PM->N->N->OFF->OFF
        // ['PM', 'PM', 'PM', 'N', 'N', 'DAY Off', 'DAY Off']
        if (assignShifts[3] == "N") {
          if (assignShifts[4] == "N") {
            if (assignShifts[5] == "DAY Off") {
              if (assignShifts[6] == "DAY Off") {
                return ["PM", "PM", "PM", "N", "N", "DAY Off", "DAY Off"];
              }
            }
          }
        }
        // PM->PM->PM->PM->PM->OFF->OFF
        // ['PM', 'PM', 'PM', 'PM', 'PM', 'DAY Off', 'DAY Off']
        if (assignShifts[3] == "PM") {
          if (assignShifts[4] == "PM") {
            if (assignShifts[5] == "DAY Off") {
              if (assignShifts[6] == "DAY Off") {
                return ["PM", "PM", "PM", "PM", "PM", "DAY Off", "DAY Off"];
              }
            }
          }
        }
      }
    }
  }

  return false;
}

// let empId = 2;
// let shiftAssignments = [];
// let fs = new Map();
// fs.set('2025-01-01', 'AM');
// fs.set('2025-01-02', 'AM');
// // fs.set('2025-01-03', 'AM');
// fs.set('2025-01-04', 'N');
// // fs.set('2025-01-05', 'N');
// fs.set('2025-01-06', 'DAY Off');
// // fs.set('2025-01-07', 'DAY Off');
// shiftAssignments[empId] = fs;
// console.log(validFiveDayPattern(Array.from(shiftAssignments[empId].values())));
// console.log(validThreeDayPattern(Array.from(shiftAssignments[empId].values())));

/**
 * verifyTotalAgentsPerShift - This function verifies the number of agents per shift according to the shift id
 * @param {*} shiftId
 * @param {*} _2icShiftsCount
 * @param {*} onlineShiftsCount
 * @param {*} callShiftsCount
 * @returns {boolean} - Returns true if the number of agents per shift is valid, otherwise false
 */
const verifyTotalAgentsPerShift = (
  shiftId,
  _2icShiftsCount,
  onlineShiftsCount,
  callShiftsCount
) => {
  const TOTAL_AGENTS_PER_6AM_SHIFT = 9;
  const TOTAL_AGENTS_PER_8AM_SHIFT = 9;
  const TOTAL_AGENTS_PER_2PM_SHIFT = 11;
  const TOTAL_AGENTS_PER_11PM_SHIFT = 2;

  let shiftsCount = _.mapObject(_.groupBy(schedules, "date"), (d) => ({
    "6AM": d.filter(
      (schedule) =>
        !schedule.isOnLeave && schedule.shift?.start_time == "06:00:00"
    ).length,
    "8AM": d.filter(
      (schedule) =>
        !schedule.isOnLeave && schedule.shift?.start_time == "08:00:00"
    ).length,
    "2PM": d.filter(
      (schedule) =>
        !schedule.isOnLeave && schedule.shift?.start_time == "14:00:00"
    ).length,
    "11PM": d.filter(
      (schedule) =>
        !schedule.isOnLeave && schedule.shift?.start_time == "23:00:00"
    ).length,
    OFF: d.filter(
      (schedule) =>
        !schedule.isOnLeave && schedule.shift?.start_time == "00:00:00"
    ).length,
    LEAVE: d.filter((schedule) => schedule.isOnLeave == true).length,
  }));

  // 6AM
  if (shiftId === 1) {
    // 2 2IC, 1 Online, 6 Call
    let totalShiftsPerDay =
      _2icShiftsCount + onlineShiftsCount + callShiftsCount;
    if (totalShiftsPerDay == TOTAL_AGENTS_PER_6AM_SHIFT) {
      return true;
    }
  }
  // 8AM
  if (shiftId === 2) {
    // 2 2IC, 1 Online, 6 Call
    let totalShiftsPerDay =
      _2icShiftsCount + onlineShiftsCount + callShiftsCount;
    if (totalShiftsPerDay == TOTAL_AGENTS_PER_8AM_SHIFT) {
      return true;
    }
  }
  // 2PM
  if (shiftId === 3) {
    // 2 2IC, 2 Online, 7 Call
    let totalShiftsPerDay =
      _2icShiftsCount + onlineShiftsCount + callShiftsCount;
    if (totalShiftsPerDay == TOTAL_AGENTS_PER_2PM_SHIFT) {
      return true;
    }
  }
  // 11PM
  if (shiftId === 4) {
    // 1 2IC, 1 Online
    let totalShiftsPerDay =
      _2icShiftsCount + onlineShiftsCount + callShiftsCount;
    if (totalShiftsPerDay == TOTAL_AGENTS_PER_11PM_SHIFT) {
      return true;
    }
  }

  return false;
};

/**
 * This function verify the total work hours for a particular employee
 * The total work hours should be 8 hours per day or 40 hours per week
 * @param {*} shifts
 * @returns
 */
const verifyTotalWorkHoursPerWeek = (shifts) => {
  let totalHours = 0;
  let shiftsInWeeks = groupByWeek(shifts);

  for (let i = 0; i < shiftsInWeeks.length; i++) {
    const shift = shifts[i];
    totalHours += shift.duration;
  }

  return totalHours >= 32 || totalHours <= 48;
};

// Function to check if the last two shifts violate the constraints
function isValidSchedule(schedule) {
  const length = schedule.length;

  // Check for 6AM after 11PM
  if (
    length > 0 &&
    schedule[length - 1] === "6AM" &&
    schedule[length - 2] === "11PM"
  ) {
    return false;
  }

  // Check for more than 2 consecutive 11PM shifts
  const lastThreeShifts = schedule.slice(-3);
  if (lastThreeShifts.every((shift) => shift === "11PM")) {
    return false;
  }

  return true;
}

// Recursive function to generate schedules
function generateSchedules(days, currentSchedule = [], result = []) {
  const shifts = ["AM", "PM", "N", "OFF"];

  if (currentSchedule.length === days) {
    result.push([...currentSchedule]); // Add a valid schedule to results
    return;
  }

  for (let shift of shifts) {
    currentSchedule.push(shift); // Add current shift

    if (isValidSchedule(currentSchedule)) {
      generateSchedules(days, currentSchedule, result); // Recur with the new schedule
    }

    currentSchedule.pop(); // Backtrack
  }
}

// Function to create a weekly schedule with 5 days on and 2 days off
function createWeeklySchedules() {
  const schedules = [];

  for (let i = 0; i < 7; i++) {
    // Start on different days of the week
    const workDays = Array(5).fill("Work");
    const offDays = Array(2).fill("Off");

    const weekPattern = [...workDays, ...offDays];

    // Generate all combinations for each work pattern
    generateSchedules(7, [], schedules);

    // Filter schedules based on the pattern of work and off days
    const validSchedules = schedules.filter((schedule) => {
      for (let j = 0; j < weekPattern.length; j++) {
        if (weekPattern[j] === "Off" && schedule[j] !== undefined) {
          return false; // Ensure off days are respected
        }
      }
      return true;
    });

    console.log(`Valid schedules starting on day ${i + 1}:`);
    validSchedules.forEach((schedule) => console.log(schedule));

    schedules.length = 0;
  }
}

// Run the function to create weekly schedules
// createWeeklySchedules();

function exceedsMaxConsecutive(user, shift) {
  return true;
}

/**
 *
 * @param {*} user
 * @returns
 */
function maintainsMinimumRest(user) {
  let daysOffLength = 1;
  return daysOffLength > 1 && daysOffLength <= 2;
}

/**
 * A valid assignment is one that
 * starts at 2pm after 2 consecutive NS followed by 2 consecutive DayOff
 * starts at 6am after 1 NS followed by 1 DayOff
 *
 * @param {*} date
 * @param {*} shift
 * @param {*} user
 * @returns
 */
function isValidAssignment(date, shift, user) {
  return (
    !exceedsMaxConsecutive(user, shift) &&
    maintainsMinimumRest(user) &&
    shift.capacityNotExceeded(date, shift) &&
    compliesWithLaborLaws(user)
  );
}

function workHoursPerDay(shift) {
  return shift.duration;
}

/**
 * Check if the given date has reached the number of NS/11PM shifts
 */
function checkNightShift(assignments = []) {
  assignments.filter((s) => s == 4).length > 1;
}

// Conflict Resolution
// 1. Check for 6AM after 11PM
// 2. Check for more than 2 consecutive 11PM shifts
// 3. Check for 3 consecutive 11PM shifts
// 4. Check for 2 consecutive 11PM shifts
// 5. Check for 6 consecutive 11PM shifts
// 6. Check for 3 consecutive 6AM shifts
// 7. Check for 2 consecutive 6AM shifts
// while conflicts exist:
// 1. Identify the conflict dates
// 2. For each conflict:
//    a. Find users with compatible shifts
//    b. Prioritize users needing  shift type completion
//    c. Swap shifts while maintaining constraints
//    d. If no solution, mark as overtime shift
function resolveConflicts(schedule) {
  let conflicts = findConflicts(schedule);

  while (conflicts.length) {
    for (let conflict of conflicts) {
      let users = findCompatibleUsers(conflict);
      let user = prioritizeUsers(users);
      let shift = findShift(user, conflict.shiftType);
      let newShift = swapShift(user, shift, conflict.date);
      if (!newShift) {
        markOvertime(user, shift, conflict.date);
      }
    }

    conflicts = findConflicts(schedule);
  }
}

function findConflicts(schedule) {
  let conflicts = [];
}

function findCompatibleUsers(conflict) {
  let users = [];
}

function prioritizeUsers(users) {
  let user = users[0];
}

function findShift(user, shiftType) {
  let shift = user.shifts.find((shift) => shift.type === shiftType);
  return shift;
}

function swapShift(user, shift, date) {
  let newShift = user.shifts.find(
    (shift) => shift.type !== shift.type && isValidAssignment(date, shift, user)
  );
  return newShift;
}

/**
 * Generates the last seven days of the previous month.
 * @returns {Array<string>} - Array of formatted date strings representing the last seven days of the previous month.
 */
function getLast7DaysOfPreviousMonth() {
  const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const last7DaysOfPrevMonth = subDays(prevMonthEnd, 7);
  // const last7Days = eachDayOfInterval({start: last7DaysOfPrevMonth, end: prevMonthEnd})

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(prevMonthEnd);
    date.setDate(prevMonthEnd.getDate() - i);
    last7Days.push(format(date, "yyyy-MM-dd"));
  }

  return last7Days;
}

function getLast7DaysOfPreviousMonthSchedules(subgroupId, startDate, endDate) {
  return getSchedulesBySubgroupNDateRange(subgroupId, startDate, endDate);
}

/**
Continuation-First Algorithm
Hybrid Approach
The Predictive Scheduling method uses historical data to anticipate patterns

# The Phase Offsett Calculation
Remaining Days Calculation:
Phase Offset = (Total Pattern Days - Last Month's Position) mod Pattern Length

Example (5/2 pattern):
Last worked day: Day 4 (0-indexed)
Phase Offset = (7 - 4) % 7 = 3
New month starts at pattern day index 3
*/

function detectUnfinishedPatterns(assignments = []) {
  let patterns = [];
  let consecutiveWorkDays = 0;

  // Step 1: Find consecutive work days at the end
  for (let i = assignments.length - 1; i >= 0; i--) {
    if (assignments[i] === "w") consecutiveWorkDays++;
    else break;
  }

  // Step 2: Compare to pattern requirements
  if (consecutiveWorkDays < 3) {
    patterns.push({
      message: `3/1 pattern incomplete (needs ${
        3 - consecutiveWorkDays
      } more w days)`,
      pattern: "3/1",
      incompletePattern: 3 - consecutiveWorkDays,
      daysWorked: consecutiveWorkDays,
    });
  } else if (consecutiveWorkDays < 5) {
    patterns.push({
      message: `5/2 pattern incomplete (needs ${
        5 - consecutiveWorkDays
      } more w days)`,
      pattern: "5/2",
      incompletePattern: 5 - consecutiveWorkDays,
      daysWorked: consecutiveWorkDays,
    });
  } else {
    patterns.push({
      message: "No incomplete pattern detected",
      pattern: null,
      incompletePattern: 0,
      daysWorked: 0,
    });
  }

  return patterns;
}

const patternCycle = {
  "5/2": [1, 1, 1, 1, 1, 0, 0], // 1=work, 0=off
  "3/1": [1, 1, 1, 0],
};

function assignContinuationShift(user, date, workingDays) {
  let fs = {};

  for (let i = 0; i < workingDays; i++) {
    fs["date"] = date;
    fs["assignment"] = "AM";
  }

  return fs;
}

function getStartOffset(user) {
  const lastDayIndex = user.lastWorkedDayIndex;
  const pattern = patternCycle[user.pattern];
  return (pattern.length - lastDayIndex) % pattern.length;
}

function transitionMonth(user, newMonthStartDate) {
  // Continue mid-pattern
  if (user.remainingWorkDays > 0) {
    assignWorkDays(user.remainingWorkDays);
  } else if (user.remainingRestDays > 0) {
    assignRestDays(user.remainingRestDays);
  }

  // Start new pattern if previous completed
  if (user.patternCompleted) {
    user.pattern = selectNewPattern();
    resetPosition();
  }
}

const patternAlignment = {
  [patternCycle["5/2"]]: {
    check: (user, calendar) => {
      const workedDays = getWorkedDaysLastMonth(user);
      const shouldContinue = workedDays % 5 !== 0;
      return shouldContinue ? 5 - (workedDays % 5) : 0;
    },
  },
  [patternCycle["3/1"]]: {
    check: (user, calendar) => {
      const workedDays = getWorkedDaysLastMonth(user);
      return workedDays % 3;
    },
  },
};

function handleCrossOver(user, newMonthStart) {
  const daysNeeded = patternAlignment[user.pattern].check(user);
  const availableDays = getBusinessDays(newMonthStart);

  return Math.min(daysNeeded, availableDays);
}

function canAssignFiveDay(currentDay, totalDays) {
  return currentDay + 7 <= totalDays; // 5 working + 2 off
}

function canAssignThreeDay(currentDay, totalDays) {
  return currentDay + 4 <= totalDays; // 3 working + 1 off
}

function toggleShiftType(shiftType) {
  return shiftType === "AM" ? "PM" : "AM";
}

function assignPattern(
  startDay,
  workingDays,
  daysOff,
  dates,
  shifts,
  assignedShifts,
  shiftType,
  user
) {
  let day;
  // Assign consecutive working days
  for (day = startDay; day < startDay + workingDays; day++) {
    if (day >= dates.length) break;
    assignShift(dates[day], shifts, assignedShifts, shiftType, user);
  }

  for (let i = 0; i < daysOff; i++) {
    if (day + i >= dates.length) break;
    assignedShifts.push({ date: dates[day + i], shift: 5 });
  }

  const totalDays = Math.min(workingDays + daysOff, dates.length - startDay);
  return totalDays;
}

function assignRemainingDays(
  startDay,
  dates,
  shifts,
  assignedShifts,
  shiftType,
  user
) {
  let daysProcessed = 0;
  let currentShiftType = shiftType;

  for (let day = startDay; day < dates.length; day++) {
    assignShift(dates[day], shifts, assignedShifts, currentShiftType, user);
    currentShiftType = toggleShiftType(currentShiftType);
    daysProcessed++;
  }

  return daysProcessed;
}

function assignShift(date, shifts, assignedShifts, preferredType, user) {
  const isAM = preferredType === "AM";
  const category = isAM ? "A" : "P";
  let shift = isAM
    ? getRandomAMShift(shifts)?.id
    : getRandomPMShift(shifts)?.id;

  // Check availability and fallback
  if (!isShiftAvailable(date, preferredType)) {
    const isAM = category === "A";
    const fallbackCategory = isAM ? "P" : "A";
    shift = isAM ? getRandomAMShift(shifts)?.id : getRandomPMShift(shifts)?.id;
  }

  assignedShifts.push({ date: date, shift: shift });
  trackShiftAssignment(date, category === "A" ? "AM" : "PM");
}

// let shift = ['w','w','o','w','o','w','w'];
// let offShiftToLastIdx = shift.lastIndexOf('o');
// let offShiftToLastDist = shift.length - offShiftToLastIdx;
// let splitShifts = shift.slice(offShiftToLastIdx+1, shift.length);
// let rightShiftsCount = offShiftToLastDist-1;
// let leftShiftsCount = offShiftToLastIdx+1;

// if (rightShiftsCount == 3 && leftShiftsCount == 3 && offDaysCount === 1) shiftPatternType = '5/2';
// if (rightShiftsCount == 3 && leftShiftsCount == 3 && offDaysCount === 1) shiftPatternType = '3/1';

// console.log(offShiftToLastDist)

exports.serializeData = (data) => JSON.parse(JSON.stringify(data, null, 2));

//   if (workDaysLength + offDaysLength > remainingDays) {
//     if (remainingDays <= workDaysLength) {
//       workDaysLength = remainingDays;
//       offDaysLength = 0;
//     } else {
//       offDaysLength = remainingDays - workDaysLength;
//     }
//   }

//   for (let i = 0; i < workDaysLength; i++) {
//     const shiftType = pattern.pattern[i];
//     const date = dates[currentPatternIndex + i];

//     if (shiftType === "NS" && !isShiftAvailable(date, "NS")) {
//       // If night shift not available, fallback to PM
//       assignedShifts.push({
//         date: date,
//         shift: SHIFTS.PM.id,
//       });
//       trackShiftAssignment(date, "PM");
//     } else {
//       assignedShifts.push({
//         date: date,
//         shift: SHIFTS[shiftType].id,
//       });
//       trackShiftAssignment(date, shiftType);
//       lastNightShift = shiftType === "NS";
//     }
//   }

//   for (let i = 0; i < offDaysLength; i++) {
//     assignedShifts.push({
//       date: dates[currentPatternIndex + patternLength + i],
//       shift: SHIFTS.OFF.id,
//     });
//   }

//   remainingDays -= (workDaysLength + offDaysLength);
//   currentPatternIndex++;
// }

function calculateCost(userIdx) {
  return {};
}

/**
 * Hungarian Method
 * @param {*} A
 * @returns
 */
function hungarianMethod(A) {
  let m = A.length;
  let n = A[0].length;

  // subtract least cost element in each row from all the components
  for (let i = 0; i < m; i++) {
    // subtract from each row
    let minVal = Infinity;
    for (let j = 0; j < n; j++) {
      if (A[i][j] < minVal) {
        minVal = A[i][j];
      }
    }

    // Subtract the minimum value from each element in the row
    for (let j = 0; j < n; j++) {
      A[i][j] -= minVal;
    }
  }

  // subtract least cost element in each column from all the components
  for (let j = 0; j < n; j++) {
    // subtract from each column
    let minVal = Infinity;
    for (let i = 0; i < m; i++) {
      if (A[i][j] < minVal) {
        minVal = A[i][j];
      }
    }

    // Subtract the minimum value from each element in the column
    for (let i = 0; i < m; i++) {
      A[i][j] -= minVal;
    }
  }

  // Check if each column has at least one zero
  let hasZeroInEachColumn = true;
  for (let j = 0; j < m; j++) {
    let hasZero = false;

    for (let i = 0; i < n; i++) {
      if (A[i][j] === 0) {
        hasZero = true;
        break;
      }
    }

    if (!hasZero) {
      hasZeroInEachColumn = false;
      break;
    }
  }

  return {
    array: A,
    hasZeroInEachColumn,
  };
}

// let A = [
//   [9, 22, 58, 11, 19],
//   [43, 78, 72, 50, 63],
//   [41, 28, 91, 37, 45],
//   [74, 42, 27, 49, 39],
//   [36, 11, 57, 22, 25]
// ]
let A = [
  [20, 15, 18, 20, 25],
  [18, 20, 12, 14, 15],
  [21, 23, 25, 27, 25],
  [17, 18, 21, 23, 20],
  [18, 18, 16, 19, 20],
];
// let result = hungarianMethod(A);
// console.log(result)

// const string = "abcde";
// const iterator2 = string[Symbol.iterator]();
// console.log(iterator2.next().value);
// console.log(iterator2.next().value);

// function* iterator3() {
//   yield 'a';
//   yield 'b';
//   yield 'c';
//   yield 'd';
//   yield 'e';
// }
// for (let x of iterator3()) {
//   console.log(x);
// }

function* shiftScheduleGenerator(user, startDate, endDate, shifts) {
  const dates = getDatesWithinRange(startDate, endDate);
  // const assignedShifts = assignShiftsToDates(dates, shifts, user);

  yield { user, schedules: "assignedShifts" };
}

// let iterator = shiftScheduleGenerator(draftScedule.userId, draftScedule.startDate, draftScedule.endDate, draftScedule.shifts)
// console.log(iterator.next().value);

// Conflict Procedure
function solveConflict(i, j, c, _c) {
  if (someCell[i][j] == c && j_ != j) {
    someCell[i][j] = _c;
  } else {
    return;
  }

  if (someCell[i_][j_] == _c && i_ != i) {
    someCell[i_][i_] = c;
    solveConflict(i_, j_, c, _c);
  } else {
    return;
  }
}

function algoAssignment(n) {
  for (let i = 1; i < n; i++) {
    while (isColored(row[i]) && isOccupied(row[i])) {
      // find a first uncolored occupied cell (i, j)
      // find a color c not assigned in column j
      // assign c to (i, j)
      if (cellCount(row[i], c) == 2) {
        // find a color _c that is not assigned in row i
        solveConflict(i, j, c, _c);
      }
    }
  }
}

function mapEmployeeIdToMatrixColumn(arr, mat) {}

function generateDummyData(startDate, endDate) {
  const data = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    data.push({
      date: currentDate.toISOString().split("T")[0],
      shift: Math.floor(Math.random() * 5) + 1,
    });

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}
const dummyData = generateDummyData("2025-01-01", "2025-04-30");

// Prepare training dataset
var training_data = dummyData;
// [
// 	{"date":"2025-02-18", "shift":1},
// 	{"date":"2025-02-19", "shift":1},
// 	{"date":"2025-02-20", "shift":2},
// 	{"date":"2025-02-21", "shift":2},
// 	{"date":"2025-02-22", "shift":3},
// 	{"date":"2025-02-23", "shift":3},
// 	{"date":"2025-02-24", "shift":2},
// 	{"date":"2025-02-25", "shift":4}
// ];

var test_data = [
  { date: "2025-02-26", shift: 2 },
  { date: "2025-02-27", shift: 2 },
  { date: "2025-02-28", shift: 2 },
  { date: "2025-02-29", shift: 4 },
];
// Setup Target Class used for prediction
var class_name = "shift";
// Setup Features to be used by decision tree
var features = ["date"];
// Create decision tree and train the model
var dt = new DecisionTree(class_name, features);
dt.train(training_data);

// Alternately, you can also create and train the tree when instantiating the tree itself:
var dt = new DecisionTree(training_data, class_name, features);
// Predict class label for an instance
var predicted_class = dt.predict({
  date: "2025-02-30",
});
console.log("2025-02-30", SHIFT_TYPES.getShiftTypeName(predicted_class));

// Evaluate model on a dataset
// var accuracy = dt.evaluate(test_data);
// console.log(accuracy)
// Export underlying model for visualization or inspection
// var treeJson = dt.toJSON();
// Create a decision tree from a previously trained model
// var treeJson = dt.toJSON();
// var preTrainedDecisionTree = new DecisionTree(treeJson);
// console.log(preTrainedDecisionTree)

class BSTNode {
  data;
  left;
  right;

  constructor(data, left, right) {
    this.data = data;
    this.left = left;
    this.right = right;
  }

  show() {
    return this.data;
  }
}

class BinarySearchTree {
  root;

  constructor() {
    this.root = null;
  }

  insert(data) {
    let n = new BSTNode(data, null, null);
    if (this.root == null) {
      this.root = n;
    } else {
      let current = this.root;
      let parent;
      while (true) {
        parent = current;
        if (data < current.data) {
          current = current.left;
          if (current == null) {
            parent.left = n;
            break;
          }
        } else {
          current = current.right;
          if (current == null) {
            parent.right = n;
            break;
          }
        }
      }
    }
  }

  inOrder(node) {
    if (!(node == null)) {
      this.inOrder(node.left);
      console.log(node.show() + " ");
      this.inOrder(node.right);
    }
  }

  preOrder(node) {
    if (!(node == null)) {
      console.log(node.show() + " ");
      this.preOrder(node.left);
      this.preOrder(node.right);
    }
  }

  postOrder(node) {
    if (!(node == null)) {
      this.postOrder(node.left);
      this.postOrder(node.right);
      console.log(node.show() + " ");
    }
  }

  /**
   * Finds the minimum value of a BST
   * @returns
   */
  getMin() {
    let current = this.root;
    while (!(current?.left == null)) {
      current = current.left;
    }
    return current?.data;
  }

  /**
   * Finds the maximum value of a BST
   * @returns
   */
  getMax() {
    let current = this.root;
    while (!(current?.right == null)) {
      current = current.right;
    }
    return current?.data;
  }

  /**
   * Searches the BST for a value
   * @param data
   * @returns {Node}
   */
  find(data) {
    let current = this.root;

    while (current?.data != data) {
      if (data < current?.data) {
        current = current?.left;
      } else {
        current = current?.right;
      }
      if (current == null) {
        return null;
      }
    }

    return current;
  }

  remove(data) {
    let node = this.removeNode(this.root, data);
    if (node) {
      this.root = node;
    } else {
      this.root = null;
    }
  }

  removeNode(node, data) {
    if (node == null) {
      return null;
    }
    if (data === node.data) {
      // node has no children
      if (node.left == null && node.right == null) {
        return null;
      }
      // node has no left child
      if (node.left == null) {
        return node.right;
      }
      // node has no right child
      if (node.right == null) {
        return node.left;
      }

      // node has two children
      let tempNode = this.getSmallest(node.right);
      node.data = tempNode.data;
      node.right = this.removeNode(node.right, tempNode.data);
      return node;
    } else if (data < node.data) {
      node.left = this.removeNode(node.left, data);
      return node;
    } else {
      node.right = this.removeNode(node.right, data);
      return node;
    }
  }

  getSmallest(node) {
    if (node) {
      Math.max([node.data]);
    } else {
      return node;
    }
  }

  getNodesCount() {}

  getEdgesCount() {
    let current = this.root;

    while (current != null) {}
  }

  printTree() {
    let current = this.root;
    let data = {};

    while (current != null) {
      data[current.data] = current.left?.data;
      data[current.data] = current.right?.data;

      if (current.left != null) {
        current = current.left;
      } else if (current.right != null) {
        current = current.right;
      } else {
        current = null;
      }
    }
    console.log(data);
  }
}

// let bst = new BinarySearchTree();
// bst.insert("A6");
// bst.insert("A6");
// bst.insert("A8");
// bst.insert("PM");
// console.log(bst.printTree());

// Function to find the maximum
// neighbor within the distance
// of less than equal to K
function getMaxNeighbour(A, K) {
  let ans = A;

  // Loop to find the maximum
  // element within the distance
  // of less than K
  for (let q = 1; q <= K; q++) {
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[0].length; j++) {
        let maxi = ans[i][j];
        if (i > 0) maxi = Math.max(maxi, ans[i - 1][j]);
        if (j > 0) maxi = Math.max(maxi, ans[i][j - 1]);
        if (i < A.length - 1) maxi = Math.max(maxi, ans[i + 1][j]);
        if (j < A[0].length - 1) maxi = Math.max(maxi, ans[i][j + 1]);
        A[i][j] = maxi;
      }
    }
    ans = A;
  }
  return ans;
}

function printMatrix(A) {
  // Loop to iterate over the matrix
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0].length; j++) {
      console.log(A[i][j], " ");
    }
    console.log("</br>");
  }
}

// A schedule represents a single employee's work schedule,
// let singleEmployeeSchedule = new LinkedList();
// singleEmployeeSchedule.insert("a");
// let nodeData = singleEmployeeSchedule.find("a");
// singleEmployeeSchedule.insertAfter(nodeData.getData(), "hello");
// singleEmployeeSchedule.printList();

// function getEnergy(v) {
//   return Math.abs(v * v - 16);
// }

// function newState(x) {
//   return x + (Math.random() - 0.5);
// }

// // linear temperature decreasing
// function getTemp(prevTemperature) {
//   return prevTemperature - 0.001;
// }

// var result = simulatedAnnealing({
//   initialState: Math.random() * 16,
//   tempMax: 15,
//   tempMin: 0.001,
//   newState: newState,
//   getTemp: getTemp,
//   getEnergy: getEnergy,
// });

// console.log(result)
