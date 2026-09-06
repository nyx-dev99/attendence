export interface ClassEntry {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  start: string
  end: string
  course: string
  teacher?: string
  room?: string
}

export interface TeacherInfo {
  initials: string
}

export interface YearData {
  schedule: ClassEntry[]
  teachers: Record<string, TeacherInfo>
}

export interface ProgramData {
  years: Record<string, YearData>
}

export const SCHEDULE_DATA: Record<string, ProgramData> = {
  "B.Sc. (Hons) Physics": {
    years: {
      "First Year": {
        schedule: [
          { day: "Mon", start: "08:30", end: "12:30", course: "GE" },
          { day: "Mon", start: "12:30", end: "14:30", course: "MP-I", teacher: "Dr. Vivek Prajapati", room: "NSB 28" },
          { day: "Mon", start: "14:30", end: "17:30", course: "CORE" },
          { day: "Tue", start: "08:30", end: "09:30", course: "CORE" },
          { day: "Tue", start: "09:30", end: "10:30", course: "Mech", teacher: "Dr. Bharti Rohila", room: "NSB 3" },
          { day: "Tue", start: "10:30", end: "12:30", course: "Mechanics Lab", teacher: "Dr. Bharti Rohila & New Comer 2", room: "PL1" },
          { day: "Tue", start: "12:30", end: "14:30", course: "AEC" },
          { day: "Tue", start: "14:30", end: "16:30", course: "VAC" },
          { day: "Wed", start: "08:30", end: "12:30", course: "W & O Lab", teacher: "Dr. Parul Yadav & Dr. Mansi Dhingra", room: "PL1" },
          { day: "Wed", start: "12:30", end: "16:30", course: "GE" },
          { day: "Thu", start: "08:30", end: "12:30", course: "GE" },
          { day: "Thu", start: "12:30", end: "14:30", course: "Mech", teacher: "Dr. Bharti Rohila", room: "NSB 28" },
          { day: "Thu", start: "14:30", end: "16:30", course: "MP-I Lab", teacher: "Dr. Bharti Rohila & Dr. Vivek Prajapati", room: "NSB 7" },
          { day: "Fri", start: "08:30", end: "09:30", course: "CORE" },
          { day: "Fri", start: "09:30", end: "11:30", course: "W & O", teacher: "Dr. Mansi Dhingra", room: "PL2" },
          { day: "Fri", start: "11:30", end: "12:30", course: "MP-I", teacher: "Dr. Rinku Kumar", room: "NSB 28" },
          { day: "Fri", start: "12:30", end: "13:30", course: "GE" },
          { day: "Fri", start: "13:30", end: "15:30", course: "CORE" },
          { day: "Fri", start: "15:30", end: "17:30", course: "VAC" },
          { day: "Sat", start: "08:30", end: "12:30", course: "SEC" },
          { day: "Sat", start: "12:30", end: "13:30", course: "CLUSTER" },
          { day: "Sat", start: "13:30", end: "17:30", course: "AEC" }
        ],
        teachers: {
          "Prof. Shalini Lumb Talwar": { initials: "SL" },
          "Dr. Mansi Dhingra": { initials: "MD" },
          "Dr. Bharti Rohila": { initials: "BR" },
          "Dr. Parul Yadav": { initials: "PY" },
          "Dr. Rinku Kumar": { initials: "RK" },
          "Dr. Vivek Prajapati": { initials: "VP" },
          "New Comer 2": { initials: "NC 2" }
        }
      },
      "Second Year": {
        schedule: [
          { day: "Mon", start: "08:30", end: "09:30", course: "CORE" },
          { day: "Mon", start: "10:30", end: "12:30", course: "DSE NA", teacher: "Dr. Bharti Rohila", room: "NSB 27" },
          { day: "Mon", start: "12:30", end: "16:30", course: "L & M Lab", teacher: "Prof. Poonam Juneja & Prof. Shalini Lumb Talwar", room: "PL2" },
          { day: "Mon", start: "16:30", end: "17:30", course: "CORE" },
          { day: "Tue", start: "08:30", end: "10:30", course: "VAC" },
          { day: "Tue", start: "10:30", end: "11:30", course: "DE", teacher: "Prof. Ritu Dhingra", room: "NSB 28" },
          { day: "Tue", start: "11:30", end: "12:30", course: "CORE" },
          { day: "Tue", start: "12:30", end: "14:30", course: "MP-III Lab", teacher: "Dr. Savvi Mishra & Dr. Vivek Prajapati", room: "Comp Lab 1" },
          { day: "Tue", start: "14:30", end: "15:30", course: "CORE" },
          { day: "Tue", start: "15:30", end: "16:30", course: "CORE" },
          { day: "Tue", start: "16:30", end: "17:30", course: "CORE" },
          { day: "Wed", start: "08:30", end: "10:30", course: "DE", teacher: "Prof. Ritu Dhingra", room: "NSB 28" },
          { day: "Wed", start: "10:30", end: "11:30", course: "CORE" },
          { day: "Wed", start: "11:30", end: "12:30", course: "L & M", teacher: "Prof. Poonam Juneja", room: "NSB 28" },
          { day: "Wed", start: "12:30", end: "14:30", course: "DSE NA Lab", teacher: "Dr. Bharti Rohila", room: "NSB 7" },
          { day: "Wed", start: "14:30", end: "15:30", course: "DSE/GE" },
          { day: "Wed", start: "15:30", end: "16:30", course: "DSE/GE" },
          { day: "Wed", start: "16:30", end: "17:30", course: "DSE/GE" },
          { day: "Thu", start: "08:30", end: "10:30", course: "DE Lab", teacher: "Prof. Ritu Dhingra & Dr. Vasudha Agarwal", room: "PL2" },
          { day: "Thu", start: "10:30", end: "11:30", course: "MP-III", teacher: "Mrs. Polly Biswas", room: "NSB 28" },
          { day: "Thu", start: "11:30", end: "12:30", course: "L & M", teacher: "Prof. Poonam Juneja", room: "NSB 28" },
          { day: "Thu", start: "12:30", end: "14:30", course: "DSE NA Lab", teacher: "Dr. Vivek Prajapati", room: "NSB 7" },
          { day: "Thu", start: "14:30", end: "15:30", course: "DSE/GE" },
          { day: "Thu", start: "15:30", end: "16:30", course: "DSE/GE" },
          { day: "Thu", start: "16:30", end: "17:30", course: "DSE/GE" },
          { day: "Fri", start: "08:30", end: "10:30", course: "AEC" },
          { day: "Fri", start: "10:30", end: "12:30", course: "MP-III", teacher: "Mrs. Polly Biswas", room: "NSB 27" },
          { day: "Fri", start: "12:30", end: "13:30", course: "DSE/GE" },
          { day: "Fri", start: "13:30", end: "15:30", course: "VAC" },
          { day: "Fri", start: "15:30", end: "17:30", course: "CORE" },
          { day: "Sat", start: "08:30", end: "12:30", course: "AEC" },
          { day: "Sat", start: "12:30", end: "13:30", course: "CLUSTER" },
          { day: "Sat", start: "13:30", end: "17:30", course: "SEC" }
        ],
        teachers: {
          "Prof. Poonam Juneja": { initials: "PJ" },
          "Prof. Ritu Dhingra": { initials: "RD" },
          "Prof. Shalini Lumb Talwar": { initials: "SL" },
          "Mrs. Polly Biswas": { initials: "PB" },
          "Dr. Savvi Mishra": { initials: "SM" },
          "Dr. Vivek Prajapati": { initials: "VP" },
          "Dr. Vasudha Agarwal": { initials: "VA" },
          "Dr. Bharti Rohila": { initials: "BR" }
        }
      },
      "Third Year": {
        schedule: [
          { day: "Mon", start: "08:30", end: "09:30", course: "DE", teacher: "Dr. Vasudha Agarwal", room: "NSB 28" },
          { day: "Mon", start: "09:30", end: "11:30", course: "QM", teacher: "Dr. Parul Yadav", room: "NSB 28" },
          { day: "Mon", start: "11:30", end: "12:30", course: "DSE RM", teacher: "Dr. Prajwalit Shikha", room: "NSB 28" },
          { day: "Mon", start: "12:30", end: "14:30", course: "DSE" },
          { day: "Mon", start: "14:30", end: "16:30", course: "GE" },
          { day: "Mon", start: "16:30", end: "17:30", course: "GE" },
          { day: "Tue", start: "08:30", end: "10:30", course: "CORE" },
          { day: "Tue", start: "10:30", end: "12:30", course: "QM Lab", teacher: "Dr. Parul Yadav & Dr. Savvi Mishra", room: "NSB 7" },
          { day: "Tue", start: "12:30", end: "14:30", course: "GE" },
          { day: "Tue", start: "14:30", end: "16:30", course: "DSE RM", teacher: "Dr. Prajwalit Shikha", room: "NSB 28" },
          { day: "Tue", start: "16:30", end: "17:30", course: "CORE" },
          { day: "Wed", start: "08:30", end: "10:30", course: "DE Lab", teacher: "Mrs. Polly Biswas & Dr. Vasudha Agarwal", room: "PL2" },
          { day: "Wed", start: "10:30", end: "11:30", course: "DE", teacher: "Dr. Vasudha Agarwal", room: "83" },
          { day: "Wed", start: "11:30", end: "12:30", course: "CORE" },
          { day: "Wed", start: "12:30", end: "14:30", course: "DSE RM Lab", teacher: "Prof. Poonam Juneja & Dr. Prajwalit Shikha", room: "PL1" },
          { day: "Wed", start: "14:30", end: "16:30", course: "EMT", teacher: "Mr. Dinesh Kumar", room: "NSB 28" },
          { day: "Wed", start: "16:30", end: "17:30", course: "DSE" },
          { day: "Thu", start: "08:30", end: "10:30", course: "GE" },
          { day: "Thu", start: "10:30", end: "11:30", course: "DE", teacher: "Dr. Vasudha Agarwal", room: "PL2" },
          { day: "Thu", start: "11:30", end: "12:30", course: "EMT", teacher: "Dr. Parul Yadav", room: "NSB 28" },
          { day: "Thu", start: "12:30", end: "13:30", course: "QM", teacher: "Dr. Parul Yadav", room: "NSB 28" },
          { day: "Thu", start: "13:30", end: "15:30", course: "EMT Lab", teacher: "Dr. Parul Yadav & Dr. Savvi Mishra", room: "PL2" },
          { day: "Thu", start: "15:30", end: "17:30", course: "CORE" },
          { day: "Fri", start: "08:30", end: "10:30", course: "CORE" },
          { day: "Fri", start: "10:30", end: "12:30", course: "GE" },
          { day: "Fri", start: "12:30", end: "13:30", course: "CLUSTER" },
          { day: "Fri", start: "13:30", end: "17:30", course: "SEC" },
          { day: "Sat", start: "08:30", end: "10:30", course: "CORE" },
          { day: "Sat", start: "10:30", end: "12:30", course: "GE" },
          { day: "Sat", start: "12:30", end: "14:30", course: "GE" },
          { day: "Sat", start: "14:30", end: "16:30", course: "GE" }
        ],
        teachers: {
          "Prof. Poonam Juneja": { initials: "PJ" },
          "Mrs. Polly Biswas": { initials: "PB" },
          "Mr. Dinesh Kumar": { initials: "DK" },
          "Dr. Prajwalit Shikha": { initials: "PS" },
          "Dr. Parul Yadav": { initials: "PY" },
          "Dr. Savvi Mishra": { initials: "SM" },
          "Dr. Vasudha Agarwal": { initials: "VA" },
          "New Comer 2": { initials: "NC 2" }
        }
      }
    }
  },
  "B.Sc. Physical Science with Chemistry": {
    years: {
      "First Year": {
        schedule: [
          { day: "Mon", start: "08:30", end: "12:30", course: "GE" },
          { day: "Mon", start: "12:30", end: "13:30", course: "Phy Mechanics", teacher: "Dr. Rohtash Singh", room: "NSB 27" },
          { day: "Mon", start: "13:30", end: "17:30", course: "Phy Mechanics Lab", teacher: "Dr. Rohtash Singh & Mrs. Polly Biswas", room: "PL1" },
          { day: "Tue", start: "08:30", end: "12:30", course: "Chem DSC Lab", teacher: "Dr. Ankita Chaudhary, Mr. Kamal Sharma & Dr. Rajni Johar", room: "Lab 2" },
          { day: "Tue", start: "12:30", end: "14:30", course: "AEC" },
          { day: "Tue", start: "14:30", end: "16:30", course: "VAC" },
          { day: "Wed", start: "08:30", end: "10:30", course: "Topics in Calculus", teacher: "MK", room: "NSB 17" },
          { day: "Wed", start: "10:30", end: "11:30", course: "Phy Mechanics", teacher: "Dr. Rohtash Singh", room: "NSB 28" },
          { day: "Wed", start: "11:30", end: "12:30", course: "CHEM DSC", teacher: "Dr. Harish Kumar Chaudhary", room: "59" },
          { day: "Wed", start: "12:30", end: "16:30", course: "GE" },
          { day: "Thu", start: "08:30", end: "12:30", course: "GE" },
          { day: "Thu", start: "12:30", end: "13:30", course: "CHEM DSC", room: "62" },
          { day: "Thu", start: "13:30", end: "14:30", course: "CORE" },
          { day: "Thu", start: "15:30", end: "17:30", course: "CORE" },
          { day: "Fri", start: "08:30", end: "09:30", course: "CORE" },
          { day: "Fri", start: "09:30", end: "12:30", course: "Topics in Calculus", teacher: "MK", room: "NSB 18" },
          { day: "Fri", start: "12:30", end: "13:30", course: "GE" },
          { day: "Fri", start: "13:30", end: "15:30", course: "CORE" },
          { day: "Fri", start: "15:30", end: "17:30", course: "VAC" },
          { day: "Sat", start: "08:30", end: "12:30", course: "SEC" },
          { day: "Sat", start: "12:30", end: "13:30", course: "CLUSTER MOVEMENT" },
          { day: "Sat", start: "13:30", end: "17:30", course: "AEC" }
        ],
        teachers: {
          "Mrs. Polly Biswas": { initials: "PB" },
          "Dr. Savvi Mishra": { initials: "SM" },
          "Dr. Rohtash Singh": { initials: "RS" },
          "Dr. Pooja Saluja": { initials: "PS" },
          "Dr. Ankita Chaudhary": { initials: "AC" },
          "Mr. Kamal Sharma": { initials: "KS" },
          "Dr. Rajni Johar": { initials: "RJ" },
          "Mr. Roop Singh Meena": { initials: "RSM" },
          "Dr. Harish Kumar Chaudhary": { initials: "HKC" },
          "Name not provided yet (MK)": { initials: "MK" }
        }
      },
      "Second Year": {
        schedule: [
          { day: "Mon", start: "08:30", end: "10:30", course: "AEC" },
          { day: "Mon", start: "10:30", end: "11:30", course: "DSE/GE" },
          { day: "Mon", start: "11:30", end: "12:30", course: "Phy DSE", teacher: "NC", room: "PL1" },
          { day: "Mon", start: "12:30", end: "13:30", course: "Maths DE", teacher: "SND", room: "NSB 18" },
          { day: "Mon", start: "13:30", end: "15:30", course: "Phy H & T", teacher: "RK", room: "NSB 27" },
          { day: "Mon", start: "15:30", end: "16:30", course: "CORE" },
          { day: "Mon", start: "16:30", end: "17:30", course: "CORE" },
          { day: "Tue", start: "08:30", end: "10:30", course: "VAC" },
          { day: "Tue", start: "10:30", end: "12:30", course: "CHEM DSC", room: "DK 59" },
          { day: "Tue", start: "12:30", end: "16:30", course: "Phys H & T Lab", teacher: "Prof. Poonam Juneja & Prof. Shalini Lumb Talwar", room: "PL1" },
          { day: "Tue", start: "16:30", end: "17:30", course: "CORE" },
          { day: "Wed", start: "08:30", end: "10:30", course: "Maths DE", teacher: "SND", room: "NSB 18" },
          { day: "Wed", start: "12:30", end: "13:30", course: "Maths DSE" },
          { day: "Wed", start: "13:30", end: "14:30", course: "DSE/GE" },
          { day: "Wed", start: "12:30", end: "14:30", course: "Phy DSE Biophysics Lab (parallel option)", teacher: "Dr. Rohtash Singh", room: "PL2/DR" },
          { day: "Wed", start: "14:30", end: "16:30", course: "CHEM DSE", teacher: "KR", room: "62" },
          { day: "Wed", start: "16:30", end: "17:30", course: "DSE/GE" },
          { day: "Thu", start: "08:30", end: "12:30", course: "CHEM DSC Lab", teacher: "RG, Dr. Ankita Chaudhary & GR", room: "Lab 2" },
          { day: "Thu", start: "12:30", end: "15:30", course: "CHEM DSE", teacher: "Ms. Pamthingla", room: "Lab-1" },
          { day: "Thu", start: "12:30", end: "14:30", course: "Phy DSE (parallel option)", teacher: "NC", room: "NSB 28" },
          { day: "Thu", start: "15:30", end: "16:30", course: "DSE/GE" },
          { day: "Thu", start: "16:30", end: "17:30", course: "DSE/GE" },
          { day: "Fri", start: "08:30", end: "09:30", course: "CHEM DSC", room: "PS 62" },
          { day: "Fri", start: "09:30", end: "12:30", course: "CORE" },
          { day: "Fri", start: "12:30", end: "13:30", course: "Maths DSE" },
          { day: "Fri", start: "13:30", end: "15:30", course: "VAC" },
          { day: "Fri", start: "15:30", end: "17:30", course: "Maths DE", teacher: "SND", room: "NSB 18" },
          { day: "Sat", start: "08:30", end: "12:30", course: "AEC" },
          { day: "Sat", start: "12:30", end: "13:30", course: "CLUSTER" },
          { day: "Sat", start: "13:30", end: "17:30", course: "SEC" }
        ],
        teachers: {
          "Prof. Poonam Juneja": { initials: "PJ" },
          "Prof. Shalini Lumb Talwar": { initials: "SL" },
          "Dr. Rohtash Singh": { initials: "RS" },
          "Ms. Pamthingla": { initials: "PT" },
          "Dr. Ankita Chaudhary": { initials: "AC" },
          "Name not provided yet (NC)": { initials: "NC" },
          "Name not provided yet (RK)": { initials: "RK" },
          "Name not provided yet (RG)": { initials: "RG" },
          "Name not provided yet (GR)": { initials: "GR" },
          "Name not provided yet (KR)": { initials: "KR" },
          "Name not provided yet (SND)": { initials: "SND" }
        }
      },
      "Third Year": {
        schedule: [
          { day: "Mon", start: "09:30", end: "11:30", course: "Phy DSE DE", teacher: "Dr. Vasudha Agarwal", room: "NSB 27" },
          { day: "Mon", start: "11:30", end: "12:30", course: "Phy EMP Lab", teacher: "Dr. Savvi Mishra", room: "PL2" },
          { day: "Mon", start: "12:30", end: "13:30", course: "CHEM DSE", teacher: "Ms. Pamthingla", room: "59" },
          { day: "Mon", start: "13:30", end: "14:30", course: "CHEM DSE", teacher: "Ms. Pamthingla", room: "61" },
          { day: "Mon", start: "12:30", end: "14:30", course: "Phy DSE DE Lab (parallel option)", teacher: "Dr. Prajwalit Shikha", room: "PL2" },
          { day: "Mon", start: "14:30", end: "17:30", course: "GE" },
          { day: "Tue", start: "08:30", end: "12:30", course: "Chem DSC Lab", teacher: "Dr. Hema Bhandari, Dr. Lata Vodwal & Dr. Pratibha Chaudhary", room: "Lab 3" },
          { day: "Tue", start: "12:30", end: "14:30", course: "GE" },
          { day: "Tue", start: "14:30", end: "16:30", course: "Phy DSE DE", teacher: "Mr. Dinesh Kumar", room: "DR/PL2" },
          { day: "Tue", start: "16:30", end: "17:30", course: "CORE" },
          { day: "Wed", start: "08:30", end: "10:30", course: "Maths DSC" },
          { day: "Wed", start: "12:30", end: "13:30", course: "Maths DSE" },
          { day: "Wed", start: "12:30", end: "14:30", course: "Phy DSE DE Lab (parallel option)", teacher: "Mr. Dinesh Kumar", room: "PL2" },
          { day: "Wed", start: "13:30", end: "14:30", course: "Maths DSE" },
          { day: "Wed", start: "14:30", end: "16:30", course: "CHEM DSE", teacher: "Ms. Pamthingla", room: "Lab-2" },
          { day: "Thu", start: "08:30", end: "10:30", course: "GE" },
          { day: "Thu", start: "10:30", end: "11:30", course: "Phy EMP", teacher: "Prof. Shalini Lumb Talwar", room: "NSB 27" },
          { day: "Thu", start: "11:30", end: "12:30", course: "Phy EMP Lab", teacher: "Prof. Shalini Lumb Talwar", room: "PL2" },
          { day: "Thu", start: "13:30", end: "15:30", course: "CHEM DSC", teacher: "Dr. Praveen", room: "59" },
          { day: "Thu", start: "15:30", end: "16:30", course: "CORE" },
          { day: "Fri", start: "08:30", end: "10:30", course: "CORE" },
          { day: "Fri", start: "10:30", end: "12:30", course: "GE" },
          { day: "Fri", start: "12:30", end: "13:30", course: "Phy EMP", teacher: "Dr. Prajwalit Shikha", room: "NSB 28" },
          { day: "Fri", start: "13:30", end: "17:30", course: "SEC" },
          { day: "Sat", start: "08:30", end: "10:30", course: "Maths DSC" },
          { day: "Sat", start: "10:30", end: "12:30", course: "Maths DSE" },
          { day: "Sat", start: "12:30", end: "14:30", course: "GE" },
          { day: "Sat", start: "14:30", end: "16:30", course: "GE" }
        ],
        teachers: {
          "Prof. Shalini Lumb Talwar": { initials: "SL" },
          "Mrs. Polly Biswas": { initials: "PB" },
          "Mr. Dinesh Kumar": { initials: "DK" },
          "Dr. Prajwalit Shikha": { initials: "PS" },
          "Dr. Vasudha Agarwal": { initials: "VA" },
          "Dr. Savvi Mishra": { initials: "SM" },
          "Dr. Hema Bhandari": { initials: "HB" },
          "Dr. Lata Vodwal": { initials: "LV" },
          "Dr. Pratibha Chaudhary": { initials: "PC" },
          "Dr. Praveen": { initials: "PG" },
          "Ms. Pamthingla": { initials: "PT" }
        }
      }
    }
  }
}

export const ABBREV_LEGEND: Record<string, string> = {
  "CORE": "Core Course",
  "DSE": "Discipline Specific Elective",
  "DSE/GE": "Discipline Specific / Generic Elective",
  "GE": "Generic Elective",
  "AEC": "Ability Enhancement Course",
  "SEC": "Skill Enhancement Course",
  "VAC": "Value Addition Course",
  "MP-I / MP-III": "Mathematical Physics I / III",
  "QM": "Quantum Mechanics",
  "EMT": "Electromagnetic Theory",
  "L & M": "L & M paper (see department for full title)",
  "W & O": "Waves & Optics",
  "CLUSTER": "Cluster elective slot"
}

export const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
export const DAY_FULL: Record<string, string> = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
}
export const YEAR_ORDER = ["First Year", "Second Year", "Third Year"]

export interface ProgramCourse {
  id: string
  name: string
}

/** Distinct real courses for a student's programme + year, derived from their actual timetable
 *  (e.g. "MP-I", "CORE", "GE" for a B.Sc. Physics student) — this is what they're actually taking,
 *  so it's what should drive Mark Presence and the attendance overview. */
export function getProgramCourses(programName?: string, year?: string): ProgramCourse[] {
  if (!programName || !year) return []
  const data = SCHEDULE_DATA[programName]?.years?.[year]
  if (!data) return []
  const names = Array.from(new Set(data.schedule.map((e) => e.course)))
  return names.sort().map((name) => ({ id: name, name }))
}