'use client';
import React, { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import CardActions from '@mui/material/CardActions';
import { config } from '@/config';
import { StudentsFilters } from '@/components/dashboard/students/students-filters';
import { StudentsTable } from '@/components/dashboard/students/students-table';
import { StudentDetailsForm } from '@/components/dashboard/students/student-details-form';
import type { Student } from '@/components/dashboard/students/students-table';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import Card from '@mui/material/Card';
import { StepperWithGrid } from '@/components/dashboard/students/student-receipt-form';
//export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { XCircle as CloseIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import Dialog from '@mui/material/Dialog';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="left" ref={ref} {...props} />;
});

export default function Page(): React.JSX.Element {

    // Define initial student state
    const initialStudentState: Student = {
        id: 0,
        first_name: '',
        last_name: '',
        father_first_name: '',
        father_last_name: '',
        mother_first_name: '',
        mother_last_name: '',
        address: '',
        class_type: '',
        contact_number: '',
        date_of_birth: '',
        admission_date: ''
    };
    const [showAddForm, setShowAddForm] = useState(false);
    const [student, setStudent] = useState<Student>(initialStudentState);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student>();
    const page = 0;
    const rowsPerPage = 5;

    const handleStudentSelect = (selectedStudent) => {
        const dob = dayjs(selectedStudent.date_of_birth);
        selectedStudent.date_of_birth = dob.format('YYYY-MM-DD');
        const admissionDate = dayjs(selectedStudent.admission_date);
        selectedStudent.admission_date = admissionDate.format('YYYY-MM-DD');
        setSelectedStudent(selectedStudent);
        setOpen(true);
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/students/"); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error("Failed to fetch students data");
            }
            const data: Student[] = await response.json();
            setStudents(data);
            setError(null)
        } catch (err) {
            setError("Error fetching student data");
        } finally {
            setLoading(false);
        }
    };


    // Fetch student data from an API when the component is mounted
    useEffect(() => {
        fetchStudents();
    }, []);
    const paginatedStudents = applyPagination(students, page, rowsPerPage);

    const handleSubmit = async () => {
        try {
            // 1. Prepare the data (student in this case)
            const studentData = {
                ...student,
            };

            console.log(studentData)

            // 2. Call the POST API using axios
            const response = await axios.post('http://localhost:5000/students', studentData);

            // 3. Handle the response
            console.log('Student added successfully:', response.data);
            fetchStudents();
            setStudent(initialStudentState);
            setShowAddForm(false);
        } catch (error) {
            // Handle errors
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.response?.data || error.message);
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    const handleClear = () => {
        setStudent(initialStudentState);
        setShowAddForm(false);
    }

    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Students</Typography>
                </Stack>
                <div>
                    <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                        variant="contained" onClick={() => setShowAddForm(true)}>
                        Add
                    </Button>
                </div>
            </Stack>
            <Stack spacing={1} sx={{ flex: 'auto auto auto' }}>
                {showAddForm &&
                    <StudentDetailsForm student={student} setStudent={setStudent} />
                }
                {showAddForm &&
                    <Stack direction={'row'} sx={{ justifyContent: 'flex-end' }}>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                            <Button variant="contained" onClick={handleClear}>Clear & Close</Button>
                        </CardActions>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                            <Button variant="contained" onClick={handleSubmit}>Save</Button>
                        </CardActions>
                    </Stack>
                }
            </Stack>
            <StudentsFilters />
            {loading && <Typography>Loading ...</Typography>}
            {error && <Typography>{error}</Typography>}
            {/* Check if there are no students and display a message */}
            {students.length === 0 ? (
                <Typography>No students found</Typography>
            ) : (
                <StudentsTable
                    count={paginatedStudents.length}
                    page={page}
                    rows={paginatedStudents}
                    rowsPerPage={rowsPerPage}
                    onStudentSelect={handleStudentSelect}
                />
            )}

            <React.Fragment>

                <Dialog
                    fullScreen
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{ position: 'relative' }}>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleClose}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                            {/* <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                                Close
                            </Typography> */}
                            {/* <Button autoFocus color="inherit" onClick={handleClose}>
                                Save
                            </Button> */}
                        </Toolbar>
                    </AppBar>
                    <Card>
                        <StepperWithGrid selectedStudent={selectedStudent} />
                    </Card>
                </Dialog>
            </React.Fragment>
        </Stack>
    );
}

function applyPagination(rows: Student[], page: number, rowsPerPage: number): Student[] {
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
