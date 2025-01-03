'use client';

import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';

import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField'
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import type { Student } from '@/components/dashboard/students/students-table';
import { display } from '@mui/system';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


const class_types = [
  { value: 'playgroup', label: 'Playgroup' },
  { value: 'nursery', label: 'Nursery' },
  { value: 'lkg', label: 'L.K.G' },
  { value: 'ukg', label: 'U.K.G' },
  { value: 'daycare', label: 'Day Care' },
] as const;

interface StudentDetailsFormProps {
  student: Student;
  setStudent: React.Dispatch<React.SetStateAction<Student>>;
}

export function StudentDetailsForm({student, setStudent}: StudentDetailsFormProps): React.JSX.Element {
  //const [dob, setDob] = React.useState<Dayjs | null>(null);

  const [selectedClassType, setSelectedClassType] = useState('');
  useEffect(() => {
    // Set the initial class type when the student data is loaded
    if (student && student.class_type) {
      setSelectedClassType(student.class_type);
    }
  }, [student]);

  const handleDobChange = (date: Dayjs | null) => {
    const dayjsDate = date ? (date) : dayjs();
    setStudent({
      ...student,
      'date_of_birth': dayjsDate,
    })
  };

  const handleAdmissionDateChange = (date:Dayjs | null)=> {
    const dayjsDate = date?(date) : dayjs();
    setStudent({
      ...student,
      'admission_date': dayjsDate,
    })
  }

  const handleClassChange = (e: SelectChangeEvent<string>) => {
    student.class_type = e.target.value;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Grid container spacing={1}>
        <Stack spacing={1}>
          <Card>
            <CardHeader title="Student Details:" />
            <Divider />
            <CardContent>
              <Grid container spacing={1}>
                <Grid md={3} xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>First name</InputLabel>
                    <OutlinedInput id="first_name"
                      label="First name"
                      name="first_name"
                      value={student.first_name}
                      onChange={handleInputChange}/>
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Last name</InputLabel>
                    <OutlinedInput id="last_name"
                      label="Last name"
                      name="last_name"
                      value={student.last_name} 
                      onChange={handleInputChange}/>
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                  
                  <FormControl fullWidth required>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker label="Date of Birth" value={student.date_of_birth?student.date_of_birth:null}
                    onChange={handleDobChange}
                  />
                  </LocalizationProvider>  
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Class</InputLabel>
                    <Select label="class_type" name="class_name" variant="outlined" value={student.class_type}
                    onChange={(event) => {
                      setSelectedClassType(event.target.value); // Update state when changed
                      handleClassChange(event); // Call the parent handler if needed
                    }}>
                      {class_types.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                <FormControl fullWidth required>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker label="Admission Date" value={student.admission_date?student.admission_date:null}
                    onChange={handleAdmissionDateChange}
                  />
                  </LocalizationProvider>  
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader title="Parent Details:" />
            <Divider />
            <CardContent>
              <Grid container spacing={1}>
                <Grid md={3} xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Father first name</InputLabel>
                    <OutlinedInput id="father_first_name"
                      label="Father first name"
                      name="father_first_name"
                      value={student.father_first_name} onChange={handleInputChange}/>
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Father last name</InputLabel>
                    <OutlinedInput id="fater_last_name"
                      label="Father last name"
                      name="father_last_name"
                      value={student.father_last_name} onChange={handleInputChange}/>
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Mother first name</InputLabel>
                    <OutlinedInput id="mother_first_name"
                      label="Mother first name"
                      name="mother_first_name"
                      value={student.mother_first_name} onChange={handleInputChange}/>
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Mother last name</InputLabel>
                    <OutlinedInput id="mother_last_name"
                      label="Mother last name"
                      name="mother_last_name"
                      value={student.mother_last_name} onChange={handleInputChange}/>
                  </FormControl>
                </Grid>
                <Grid md={9} xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Address</InputLabel>
                    <OutlinedInput id="address"
                      label="Address"
                      name="address"
                      value={student.address}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Phone</InputLabel>
                    <OutlinedInput id="contact_number"
                      label="Phone"
                      name="contact_number"
                      value={student.contact_number} type='tel' onChange={handleInputChange} inputProps={{ maxLength: 10 }}/>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
          </Card>
        </Stack>
      </Grid>
    </form>
  );
}
