
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