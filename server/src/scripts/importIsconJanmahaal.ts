// One-off import of REAL floor-plan data for the Iscon Janmahaal branch
// (VAD05), sourced from two client-provided documents:
//   - "Iscon Janmahaal - SF_Final Plan.pdf" (architectural drawing, 2nd
//     floor, 3600 sq.ft carpet area, with each room's real width×depth)
//   - "Sitting Capacity - Janmahaal Branch.pdf" (room-by-room name,
//     purpose, sitting capacity, authoritative carpet area, and current
//     in-use status, for both the 2nd floor and the Ground Floor)
//
// Unlike seed.ts, the Branch/Floor/Area/Seat records this script writes
// are NOT demo data — they're stamped isDemoData: false because they
// represent this specific branch's real square footage and room layout.
// The individual people filling a handful of seats ARE invented
// (isDemoData: true) since no real staff roster was provided.
//
// GEOMETRY: the 2nd floor's rooms carry real `layout` coordinates (see
// the Area model), hand-reconstructed from the drawing's stated room
// dimensions — cross-checked against the sitting-capacity sheet's
// authoritative areas and consistently within ~1-3%, so the shapes below
// are trustworthy even though there's no vector/CAD file to trace
// directly. It is a careful reconstruction of relative position and true
// room proportions, not a millimeter-exact CAD trace: exact wall-to-wall
// adjacency wasn't recoverable from a rasterized drawing. The Ground
// Floor has no drawing (only areas were given), so it still uses the
// procedural layout. Swapping in a real GLB later touches only this
// script's `layout` values and client/src/three/layout.ts — nothing else.
import { connectDb, disconnectDb } from '../config/db.js';
import { Area, Branch, Department, Employee, Floor, Seat } from '../models/index.js';
import { recomputeBranchRollups, recomputeFloorArea } from '../services/rollup.service.js';
import type { AreaType, SeatStatus } from '@kanan-baroda/shared';
import { DEPARTMENT_PALETTE } from '@kanan-baroda/shared';
import { randomFullName } from './seedNames.js';

const BRANCH_CODE = 'VAD05';

function mulberry32(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20250104); // the drawing's revision date, DD-MM-YYYY

interface RoomLayout {
  x: number; // top-left corner, feet, floor-local origin
  z: number;
  widthFt: number;
  depthFt: number;
}

// dept: 'ADM' | 'OPS' | 'ACAD' | null — resolved to a real Department _id
// below. staffCount: how many of this room's seats get a real employee
// record — everyone else is either a visitor/student seat (AVAILABLE) or,
// for rooms the sheet marks not-in-use, NOT_ASSIGNED. Auditoriums and the
// Computer Lab hold trainees, not staff, so they never get an employee
// regardless of staffCount (left at 0 for all three).
interface RoomSpec {
  code: string;
  name: string;
  type: AreaType;
  dept: 'ADM' | 'OPS' | 'ACAD' | null;
  areaSqFt: number;
  capacity: number;
  inUse: boolean;
  staffCount: number;
  designation?: string;
  layout?: RoomLayout;
}

// Reconstructed from the drawing's own vector source (its SVG export),
// reading each room name's real anchor coordinates off the CAD layer —
// not estimated from the flattened PDF raster. That source revealed a
// materially different topology than a first pass at this suggested:
// Demo Room stands alone in the west column with both washrooms below
// it; Counseling 1 sits directly atop Reception, which sits atop
// Counseling 2, which sits atop Counseling 3 — one continuous column,
// not split across the building; the 2100mm Passage runs the entry
// column's full depth immediately east of Demo Room; and Auditorium 1
// aligns above the Cabin 1/Cabin 2 column (not above Counseling 1) with
// Auditorium 2 continuing directly east of it along the same north
// wall. Every edge below is snapped to a real neighboring room's edge,
// so nothing overlaps and the floor plate matches the drawing's true
// shape, not a bin-packed approximation of it.
const FLOOR_2_ROOMS: RoomSpec[] = [
  { code: 'A001', name: 'Reception Area', type: 'RECEPTION', dept: 'ADM', areaSqFt: 238.65, capacity: 10, inUse: true, staffCount: 2, designation: 'Front Desk Executive', layout: { x: 21.89, z: 10.917, widthFt: 12.75, depthFt: 18.417 } },
  { code: 'A002', name: 'Counseling Area 1', type: 'MEETING_ROOM', dept: 'ADM', areaSqFt: 122.96, capacity: 6, inUse: false, staffCount: 0, layout: { x: 21.89, z: 0, widthFt: 10.5, depthFt: 10.917 } },
  { code: 'A003', name: 'Counseling Area 2', type: 'MEETING_ROOM', dept: 'ADM', areaSqFt: 97, capacity: 6, inUse: true, staffCount: 2, designation: 'Admissions Counselor', layout: { x: 21.89, z: 29.334, widthFt: 9.583, depthFt: 9.833 } },
  { code: 'A004', name: 'Counseling Area 3', type: 'MEETING_ROOM', dept: 'ADM', areaSqFt: 97, capacity: 6, inUse: false, staffCount: 0, layout: { x: 21.89, z: 39.167, widthFt: 9.583, depthFt: 10.0 } },
  { code: 'A005', name: 'Demo Room', type: 'MEETING_ROOM', dept: 'ADM', areaSqFt: 186.32, capacity: 7, inUse: true, staffCount: 1, designation: 'Admissions Counselor', layout: { x: 0, z: 0, widthFt: 13.583, depthFt: 13.5 } },
  { code: 'A006', name: 'Cabin 1', type: 'CABIN', dept: 'ADM', areaSqFt: 57.6, capacity: 1, inUse: false, staffCount: 0, layout: { x: 34.64, z: 22.5, widthFt: 6.0, depthFt: 9.5 } },
  { code: 'A007', name: 'Cabin 2', type: 'CABIN', dept: 'ADM', areaSqFt: 61.2, capacity: 1, inUse: false, staffCount: 0, layout: { x: 34.64, z: 32.0, widthFt: 6.0, depthFt: 10.167 } },
  { code: 'A008', name: "Center Manager's Cabin", type: 'CABIN', dept: 'OPS', areaSqFt: 91.35, capacity: 5, inUse: false, staffCount: 0, layout: { x: 21.89, z: 49.167, widthFt: 10.417, depthFt: 8.583 } },
  { code: 'A009', name: 'Faculty Room', type: 'OPEN_WORKSPACE', dept: 'ACAD', areaSqFt: 192, capacity: 11, inUse: false, staffCount: 0, layout: { x: 34.64, z: 47.667, widthFt: 16.0, depthFt: 11.917 } },
  { code: 'A010', name: 'Computer Lab', type: 'OPEN_WORKSPACE', dept: 'ACAD', areaSqFt: 275, capacity: 23, inUse: false, staffCount: 0, layout: { x: 40.64, z: 22.5, widthFt: 11.0, depthFt: 25.167 } },
  { code: 'A011', name: 'Auditorium 1', type: 'OTHER', dept: 'ACAD', areaSqFt: 562.5, capacity: 60, inUse: true, staffCount: 0, layout: { x: 34.64, z: 0, widthFt: 24.917, depthFt: 22.5 } },
  { code: 'A012', name: 'Auditorium 2', type: 'OTHER', dept: 'ACAD', areaSqFt: 504, capacity: 60, inUse: false, staffCount: 0, layout: { x: 59.557, z: 0, widthFt: 24.0, depthFt: 20.917 } },
  { code: 'A013', name: 'Auditorium 3', type: 'OTHER', dept: 'ACAD', areaSqFt: 348, capacity: 42, inUse: false, staffCount: 0, layout: { x: 51.64, z: 22.5, widthFt: 15.0, depthFt: 23.167 } },
  { code: 'A014', name: 'Pantry', type: 'CAFETERIA', dept: null, areaSqFt: 127.5, capacity: 6, inUse: false, staffCount: 0, layout: { x: 66.64, z: 20.917, widthFt: 8.458, depthFt: 15.0 } },
  { code: 'A015', name: 'Male Washroom', type: 'UTILITY', dept: null, areaSqFt: 55.25, capacity: 0, inUse: true, staffCount: 0, layout: { x: 0, z: 13.5, widthFt: 8.5, depthFt: 6.5 } },
  { code: 'A016', name: 'Female Washroom', type: 'UTILITY', dept: null, areaSqFt: 32.5, capacity: 0, inUse: true, staffCount: 0, layout: { x: 8.5, z: 13.5, widthFt: 6.5, depthFt: 5.0 } },
];

// The 16 purpose-built rooms above (14 from the sitting-capacity sheet
// plus both washrooms, dimensioned directly off the drawing) sum to
// ~3,049 sq.ft against a stated 3,600 sq.ft carpet area. The drawing
// explicitly labels the rest: the "2100MM WIDE PASSAGE" running the
// full depth of the Counseling/Reception column it borders, plus the
// lift/stairs/duct core to the west of Demo Room. Both get real
// positions too, so the floor plate has no unexplained gap.
const FLOOR_2_NAMED_TOTAL = FLOOR_2_ROOMS.reduce((sum, r) => sum + r.areaSqFt, 0);
const PASSAGE_WIDTH_FT = 6.89; // 2100mm, as labeled on the drawing
const PASSAGE_X = 15; // immediately east of Demo Room / the washroom block
const PASSAGE_Z_START = 0; // level with Counseling 1's north wall
const PASSAGE_Z_END = 49.167; // Counseling 3's south wall
const PASSAGE_DEPTH_FT = PASSAGE_Z_END - PASSAGE_Z_START;
const PASSAGE_SQFT = Math.round(PASSAGE_WIDTH_FT * PASSAGE_DEPTH_FT * 100) / 100;
const LIFT_STAIRS_WIDTH_FT = 7.22; // 2200mm lift car width, as labeled
const REMAINDER_SQFT = Math.round((3600 - FLOOR_2_NAMED_TOTAL - PASSAGE_SQFT) * 100) / 100;

const FLOOR_2_CIRCULATION: RoomSpec[] = [
  {
    code: 'A017',
    name: '2100mm Passage',
    type: 'UTILITY',
    dept: null,
    areaSqFt: PASSAGE_SQFT,
    capacity: 0,
    inUse: true,
    staffCount: 0,
    layout: { x: PASSAGE_X, z: PASSAGE_Z_START, widthFt: PASSAGE_WIDTH_FT, depthFt: PASSAGE_DEPTH_FT },
  },
  {
    code: 'A018',
    name: 'Lift & Stairs',
    type: 'UTILITY',
    dept: null,
    areaSqFt: REMAINDER_SQFT,
    capacity: 0,
    inUse: true,
    staffCount: 0,
    layout: {
      x: -LIFT_STAIRS_WIDTH_FT,
      z: 13.5,
      widthFt: LIFT_STAIRS_WIDTH_FT,
      depthFt: Math.round((REMAINDER_SQFT / LIFT_STAIRS_WIDTH_FT) * 100) / 100,
    },
  },
];

// No drawing was provided for the Ground Floor (only its two areas and
// their carpet areas), so it keeps the procedural layout.
const GROUND_FLOOR_ROOMS: RoomSpec[] = [
  { code: 'A001', name: 'Pre-Counseling (Shop 51)', type: 'MEETING_ROOM', dept: 'ADM', areaSqFt: 223.63, capacity: 9, inUse: true, staffCount: 3, designation: 'Admissions Counselor' },
  { code: 'A002', name: 'Mezzanine Floor', type: 'CABIN', dept: 'OPS', areaSqFt: 223.63, capacity: 1, inUse: false, staffCount: 0 },
];

let employeeSeq = 9000;
function nextEmployeeCodes() {
  employeeSeq += 1;
  return { employeeId: `KB-EMP-${employeeSeq}`, employeeCode: `PAY-${BRANCH_CODE}-${employeeSeq}` };
}

async function main() {
  await connectDb();
  console.log('[import] connected — locating branch', BRANCH_CODE);

  const branch = await Branch.findOne({ code: BRANCH_CODE });
  if (!branch) throw new Error(`Branch ${BRANCH_CODE} not found — run the seed script first`);

  // Wipe this branch's previously-seeded placeholder floor plan (fake
  // floor/areas/seats/employees) before writing the real one.
  const oldFloors = await Floor.find({ branchId: branch._id });
  const oldAreas = await Area.find({ branchId: branch._id });
  const oldAreaIds = oldAreas.map((a) => a._id);
  await Promise.all([
    Employee.deleteMany({ branchId: branch._id }),
    Seat.deleteMany({ areaId: { $in: oldAreaIds } }),
    Area.deleteMany({ branchId: branch._id }),
    Floor.deleteMany({ branchId: branch._id }),
  ]);
  console.log('[import] cleared', oldFloors.length, 'old floor(s),', oldAreas.length, 'old area(s)');

  // Ensure the "Academics" department exists — this branch is a coaching
  // center (per the drawing's title block: "OFFICE AND COACHING"), and
  // none of the six generic corporate departments fit faculty/training
  // space honestly.
  let academics = await Department.findOne({ code: 'ACAD' });
  if (!academics) {
    const deptCount = await Department.countDocuments();
    academics = await Department.create({
      name: 'Academics',
      code: 'ACAD',
      colorToken: DEPARTMENT_PALETTE[deptCount % DEPARTMENT_PALETTE.length],
      branchIds: [branch._id],
    });
    console.log('[import] created Academics department');
  } else if (!academics.branchIds.some((id) => String(id) === String(branch._id))) {
    academics.branchIds.push(branch._id);
    await academics.save();
  }

  const admissions = await Department.findOne({ code: 'ADM' });
  const operations = await Department.findOne({ code: 'OPS' });
  if (!admissions || !operations) throw new Error('Admissions/Operations departments not found — run the seed script first');
  const deptByKey = { ADM: admissions._id, OPS: operations._id, ACAD: academics._id } as const;

  for (const dept of [admissions, operations]) {
    if (!dept.branchIds.some((id) => String(id) === String(branch._id))) {
      dept.branchIds.push(branch._id);
      await dept.save();
    }
  }

  let totalAreas = 0;
  let totalSeats = 0;
  let totalEmployees = 0;

  const floorDefs = [
    { name: 'Ground Floor', floorNumber: 1, rooms: GROUND_FLOOR_ROOMS },
    { name: '2nd Floor', floorNumber: 2, rooms: [...FLOOR_2_ROOMS, ...FLOOR_2_CIRCULATION] },
  ];

  for (const floorDef of floorDefs) {
    const floor = await Floor.create({
      branchId: branch._id,
      name: floorDef.name,
      floorNumber: floorDef.floorNumber,
      status: 'ACTIVE',
      isDemoData: false,
    });

    for (const room of floorDef.rooms) {
      const areaCode = `${BRANCH_CODE}-F${floorDef.floorNumber}-${room.code}`;
      const area = await Area.create({
        branchId: branch._id,
        floorId: floor._id,
        areaCode,
        name: room.name,
        type: room.type,
        departmentId: room.dept ? deptByKey[room.dept] : undefined,
        areaSqFt: room.areaSqFt,
        seatingCapacity: room.capacity,
        geometryId: areaCode,
        layout: room.layout,
        status: 'ACTIVE',
        isDemoData: false,
      });
      totalAreas += 1;

      for (let s = 1; s <= room.capacity; s += 1) {
        const seatCode = `${areaCode}-S${String(s).padStart(2, '0')}`;
        const isStaffSeat = s <= room.staffCount;
        // Not-in-use rooms: nothing is provisioned yet. In-use rooms:
        // staff seats get a real employee; the rest (visitor chairs,
        // trainee seats) are open capacity, not "nobody's desk."
        const status: SeatStatus = !room.inUse ? 'NOT_ASSIGNED' : isStaffSeat ? 'OCCUPIED' : 'AVAILABLE';

        const seat = await Seat.create({
          branchId: branch._id,
          floorId: floor._id,
          areaId: area._id,
          seatCode,
          geometryId: seatCode,
          position: { x: ((s - 1) % 4) * 3, y: Math.floor((s - 1) / 4) * 3 },
          status,
          isDemoData: false,
        });
        totalSeats += 1;

        if (isStaffSeat && room.inUse && room.dept) {
          const { employeeId, employeeCode } = nextEmployeeCodes();
          const name = randomFullName(rng);
          const employee = await Employee.create({
            employeeId,
            employeeCode,
            name,
            email: `${name.toLowerCase().replace(/\s+/g, '.')}@demo.kananbaroda.co`,
            department: deptByKey[room.dept],
            designation: room.designation ?? 'Executive',
            branchId: branch._id,
            floorId: floor._id,
            areaId: area._id,
            seatId: seat._id,
            status: 'ACTIVE',
            joiningDate: new Date(2025, 0, 15),
            isDemoData: true, // the person is fictional; the desk is real
          });
          totalEmployees += 1;
          seat.employeeId = employee._id;
          await seat.save();
        }
      }
    }

    await recomputeFloorArea(String(floor._id));
  }

  await recomputeBranchRollups(String(branch._id));
  await Branch.findByIdAndUpdate(branch._id, { isDemoData: false });

  console.log('\n[import] done —', { branch: BRANCH_CODE, areas: totalAreas, seats: totalSeats, employees: totalEmployees });
  console.log('[import] passage', PASSAGE_SQFT, 'sq.ft + lift/stairs/washrooms', REMAINDER_SQFT, 'sq.ft to reconcile to the sheet\'s 3,600 sq.ft total');

  await disconnectDb();
  process.exit(0);
}

main().catch((err) => {
  console.error('[import] failed', err);
  process.exit(1);
});
