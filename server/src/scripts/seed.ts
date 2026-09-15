// Seeds five demo Vadodara branches end to end: departments → branches →
// floors → areas → seats → employees, plus one login user per role. Every
// record this script writes is stamped `isDemoData: true` (Employee/
// Branch/Floor/Area/Seat) so it can never be mistaken for real HR data —
// see ARCH-SPEC RSK·10. Re-running it wipes only demo-flagged records.
import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../config/db.js';
import { Branch, Department, Employee, Floor, Area, Seat, User } from '../models/index.js';
import { recomputeBranchRollups, recomputeFloorArea } from '../services/rollup.service.js';
import { DEPARTMENT_PALETTE, type AreaType, type SeatStatus } from '@kanan-baroda/shared';
import { randomFullName } from './seedNames.js';

// Deterministic PRNG so re-seeding produces a stable, reviewable dataset
// instead of a different random branch mix every run.
function mulberry32(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260912);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

const DESIGNATIONS = ['Associate', 'Senior Associate', 'Analyst', 'Executive', 'Senior Executive'];

const DEPARTMENTS = [
  { name: 'Admissions', code: 'ADM' },
  { name: 'Operations', code: 'OPS' },
  { name: 'Information Technology', code: 'ITD' },
  { name: 'Human Resources', code: 'HRD' },
  { name: 'Finance', code: 'FIN' },
  { name: 'Sales & Marketing', code: 'SLS' },
];

const BRANCHES = [
  { code: 'VAD01', name: 'Alkapuri HQ', location: 'Alkapuri', floors: 2 },
  { code: 'VAD02', name: 'Gotri Campus', location: 'Gotri', floors: 1 },
  { code: 'VAD03', name: 'Manjalpur Center', location: 'Manjalpur', floors: 1 },
  { code: 'VAD04', name: 'Waghodia Road Office', location: 'Waghodia Road', floors: 1 },
  { code: 'VAD05', name: 'Sayajigunj Office', location: 'Sayajigunj', floors: 1 },
];

interface AreaTemplate {
  type: AreaType;
  name: string;
  deptIndex: number | null; // index into DEPARTMENTS, or null
  areaSqFt: number;
  seatingCapacity: number;
}

function floorTemplate(deptA: number, deptB: number, deptC: number): AreaTemplate[] {
  return [
    { type: 'RECEPTION', name: 'Reception', deptIndex: null, areaSqFt: 200, seatingCapacity: 2 },
    { type: 'CABIN', name: 'Branch Manager Cabin', deptIndex: deptA, areaSqFt: 150, seatingCapacity: 1 },
    { type: 'MEETING_ROOM', name: 'Conference Room A', deptIndex: null, areaSqFt: 300, seatingCapacity: 8 },
    { type: 'OPEN_WORKSPACE', name: `${DEPARTMENTS[deptA].name} Workspace`, deptIndex: deptA, areaSqFt: 1200, seatingCapacity: 24 },
    { type: 'OPEN_WORKSPACE', name: `${DEPARTMENTS[deptB].name} Workspace`, deptIndex: deptB, areaSqFt: 900, seatingCapacity: 18 },
    { type: 'DEPARTMENT_ZONE', name: `${DEPARTMENTS[deptC].name} Department`, deptIndex: deptC, areaSqFt: 700, seatingCapacity: 14 },
    { type: 'CAFETERIA', name: 'Cafeteria', deptIndex: null, areaSqFt: 400, seatingCapacity: 0 },
    { type: 'UTILITY', name: 'Server & Storage Room', deptIndex: null, areaSqFt: 100, seatingCapacity: 0 },
  ];
}

// Weighted seat outcome for an assignable desk — mirrors the real spread
// an office actually has, not just OCCUPIED/AVAILABLE (ARCH-SPEC DAT·02).
function rollSeatOutcome(): SeatStatus {
  const r = rng();
  if (r < 0.72) return 'OCCUPIED';
  if (r < 0.87) return 'AVAILABLE';
  if (r < 0.95) return 'RESERVED';
  return 'MAINTENANCE';
}

let employeeSeq = 1000;
function nextEmployeeCodes(branchCode: string) {
  employeeSeq += 1;
  return { employeeId: `KB-EMP-${employeeSeq}`, employeeCode: `PAY-${branchCode}-${employeeSeq}` };
}

async function main() {
  await connectDb();
  console.log('[seed] connected — clearing previous demo data');

  await Promise.all([
    Employee.deleteMany({ isDemoData: true }),
    Seat.deleteMany({ isDemoData: true }),
    Area.deleteMany({ isDemoData: true }),
    Floor.deleteMany({ isDemoData: true }),
    Branch.deleteMany({ isDemoData: true }),
    Department.deleteMany({}),
  ]);

  const departments = await Department.insertMany(
    DEPARTMENTS.map((d, i) => ({ ...d, colorToken: DEPARTMENT_PALETTE[i % DEPARTMENT_PALETTE.length], branchIds: [] })),
  );
  const branchIdsByDept = new Map<string, Set<string>>(departments.map((d) => [String(d._id), new Set<string>()]));

  const departmentManagers: Record<string, string> = {}; // dept code -> employee _id, first hire becomes the lead

  let totalAreas = 0;
  let totalSeats = 0;
  let totalEmployees = 0;

  for (const branchDef of BRANCHES) {
    const branch = await Branch.create({
      code: branchDef.code,
      name: branchDef.name,
      location: branchDef.location,
      address: `${branchDef.name}, ${branchDef.location}, Vadodara, Gujarat 390001`,
      status: 'ACTIVE',
      isDemoData: true,
    });

    for (const dept of departments) {
      branchIdsByDept.get(String(dept._id))?.add(String(branch._id));
    }

    for (let floorNumber = 1; floorNumber <= branchDef.floors; floorNumber += 1) {
      const floor = await Floor.create({
        branchId: branch._id,
        name: floorNumber === 1 ? 'Ground Floor' : `${floorNumber - 1}${floorNumber === 2 ? 'st' : 'th'} Floor`,
        floorNumber,
        status: 'ACTIVE',
        isDemoData: true,
      });

      // Rotate which three departments anchor this floor's zones so every
      // branch doesn't look identical.
      const rot = (floorNumber + BRANCHES.indexOf(branchDef)) % departments.length;
      const deptA = rot;
      const deptB = (rot + 2) % departments.length;
      const deptC = (rot + 4) % departments.length;

      const template = floorTemplate(deptA, deptB, deptC);
      let areaSeq = 1;

      for (const areaTpl of template) {
        const areaCode = `${branchDef.code}-F${floorNumber}-A${String(areaSeq).padStart(3, '0')}`;
        areaSeq += 1;

        const area = await Area.create({
          branchId: branch._id,
          floorId: floor._id,
          areaCode,
          name: areaTpl.name,
          type: areaTpl.type,
          departmentId: areaTpl.deptIndex !== null ? departments[areaTpl.deptIndex]._id : undefined,
          areaSqFt: areaTpl.areaSqFt,
          seatingCapacity: areaTpl.seatingCapacity,
          geometryId: areaCode,
          status: 'ACTIVE',
          isDemoData: true,
        });
        totalAreas += 1;

        let areaManagerId: string | undefined;
        const cols = Math.max(Math.ceil(Math.sqrt(areaTpl.seatingCapacity)), 1);

        for (let s = 1; s <= areaTpl.seatingCapacity; s += 1) {
          const seatCode = `${areaCode}-S${String(s).padStart(2, '0')}`;
          const isBookableDesk = areaTpl.type === 'CABIN' || areaTpl.type === 'OPEN_WORKSPACE' || areaTpl.type === 'DEPARTMENT_ZONE';
          const status: SeatStatus = isBookableDesk ? rollSeatOutcome() : 'NOT_ASSIGNED';

          const seat = await Seat.create({
            branchId: branch._id,
            floorId: floor._id,
            areaId: area._id,
            seatCode,
            geometryId: seatCode,
            position: { x: ((s - 1) % cols) * 3, y: Math.floor((s - 1) / cols) * 3 },
            status,
            isDemoData: true,
          });
          totalSeats += 1;

          if (status === 'OCCUPIED' && areaTpl.deptIndex !== null) {
            const dept = departments[areaTpl.deptIndex];
            const isFirstHireInDept = !departmentManagers[dept.code];
            const { employeeId, employeeCode } = nextEmployeeCodes(branchDef.code);
            const name = randomFullName(rng);

            const employee = await Employee.create({
              employeeId,
              employeeCode,
              name,
              email: `${name.toLowerCase().replace(/\s+/g, '.')}@demo.kananbaroda.co`,
              department: dept._id,
              designation: isFirstHireInDept ? `${dept.name} Manager` : pick(DESIGNATIONS),
              branchId: branch._id,
              floorId: floor._id,
              areaId: area._id,
              seatId: seat._id,
              managerId: departmentManagers[dept.code] ?? null,
              status: 'ACTIVE',
              joiningDate: new Date(2019 + Math.floor(rng() * 6), Math.floor(rng() * 12), 1 + Math.floor(rng() * 27)),
              isDemoData: true,
            });
            totalEmployees += 1;

            seat.employeeId = employee._id;
            await seat.save();

            if (isFirstHireInDept) {
              departmentManagers[dept.code] = String(employee._id);
              await Department.findByIdAndUpdate(dept._id, { headOfDepartmentId: employee._id });
            }
            areaManagerId ??= departmentManagers[dept.code];
          }
        }

        if (areaManagerId) {
          await Area.findByIdAndUpdate(area._id, { managerId: areaManagerId });
        }
      }

      await recomputeFloorArea(String(floor._id));
    }

    await recomputeBranchRollups(String(branch._id));
  }

  for (const dept of departments) {
    await Department.findByIdAndUpdate(dept._id, {
      branchIds: Array.from(branchIdsByDept.get(String(dept._id)) ?? []),
    });
  }

  // Bootstrap the one Super Admin account — the only way an admin identity
  // is ever created (ARCH-SPEC "CRITICAL ACCESS REQUIREMENT": no
  // registration route exists). Re-running the seed just resets its
  // password back to the default rather than creating a second account.
  const SUPER_ADMIN_EMAIL = 'superadmin@kananbaroda.co';
  const passwordHash = await bcrypt.hash('Demo@12345', 12);

  await User.findOneAndUpdate(
    { email: SUPER_ADMIN_EMAIL },
    { name: 'Super Admin', email: SUPER_ADMIN_EMAIL, passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE' },
    { upsert: true, new: true },
  );

  console.log('\n[seed] done —', {
    branches: BRANCHES.length,
    areas: totalAreas,
    seats: totalSeats,
    employees: totalEmployees,
    departments: departments.length,
  });
  console.log('\n[seed] Super Admin login (change this password before real deployment):');
  console.log(`  ${SUPER_ADMIN_EMAIL}  /  Demo@12345`);

  await disconnectDb();
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
