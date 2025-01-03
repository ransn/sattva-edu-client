'use client';
import React, { useState, useEffect } from 'react';
// import type { Metadata } from 'next';
// import Button from '@mui/material/Button';
// import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
// import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
// import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
// import CardActions from '@mui/material/CardActions';
// import { config } from '@/config';
import { StudentsFilters } from '@/components/dashboard/students/students-filters';
// import { StudentsTable } from '@/components/dashboard/students/students-table';
// import { StudentDetailsForm } from '@/components/dashboard/students/student-details-form';
// import axios from 'axios';
// import dayjs, { Dayjs } from 'dayjs';
import Card from '@mui/material/Card';
import { StepperWithGrid } from '@/components/fees/student-receipt-form';
//export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { XCircle as CloseIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
import { FeesSummary, FeesSummaryTable } from '@/components/fees/fees-summary-table';
import {Student} from '@/components/dashboard/students/students-table';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="left" ref={ref} {...props} />;
});

export default function Page(): React.JSX.Element {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [feesSummaryList, setFeesSummaryList] = useState<FeesSummary[]>([]);
    const [filteredFeesSummaryList, setFilteredFeesSummaryList] = useState<FeesSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openFeesDetails, setOpenFeesDetails] = React.useState(false);
    const [studentDetails, setStudentDetails] = useState<Student>();
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(0); // Current page
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleViewFeesDetails = (selectedStudentFeesSummary:FeesSummary) => {
        setOpenFeesDetails(false);
        fetchStudentDetails(selectedStudentFeesSummary.student_id);
        setOpenFeesDetails(true);
    }

    const fetchStudentDetails = async (studentId : number) => {
        try {
            const response = await fetch(`${apiUrl}/students/${studentId}`); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error("Failed to fetch student details");
            }
            const data = await response.json();
            setStudentDetails(data);
        } catch (err) {
            console.log("Error fetching student data");
        }
    }

    const handleCloseFeesDetails = () => {
        fetchFeesSummary();
        setOpenFeesDetails(false);
    };

    const fetchFeesSummary = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/fees/`); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error("Failed to fetch fees summary data");
            }
            const data: FeesSummary[] = await response.json();
            setFeesSummaryList(data);
            setFilteredFeesSummaryList(data);
            setError(null)
        } catch (err) {
            setError("Error fetching student data");
        } finally {
            setLoading(false);
        }
    };


    // Fetch student data from an API when the component is mounted
    useEffect(() => {
        fetchFeesSummary();
    }, []);

    const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
        console.log(page)
        setPage(page);
      };
    
      const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
        setRowsPerPage(parseInt(event.target.value, 10));       
        setPage(0); // Reset to first page
      };

    const paginatedStudents = applyPagination(filteredFeesSummaryList, page, rowsPerPage);

    

    const handleSearch = (searchString: string) => {
        //const value = event.target.value;
        setSearchText(searchString);
        console.log(searchText)
        const filtered = feesSummaryList.filter(feesSummary => 
            feesSummary.student_name.toLowerCase().includes(searchString.toLowerCase())
          );
          setFilteredFeesSummaryList(filtered); // Update the filtered students list
    }

    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h4">Fees Summary:</Typography>
                </Stack>
                {/* <div>
                    <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                        variant="contained" onClick={() => setShowAddForm(true)}>
                        Add
                    </Button>
                </div> */}
            </Stack>
            {/* <Stack spacing={1} sx={{ flex: 'auto auto auto' }}>
                {showAddForm &&
                    <StudentDetailsForm student={student} setStudent={setStudent} />
                }
                {showAddForm &&
                    <Stack direction={'row'} sx={{ justifyContent: 'flex-end' }}>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                            <Button variant="contained" onClick={handleClear}>Cancel</Button>
                        </CardActions>
                        
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                            {student && student.id === 0 && (
                                <Button variant="contained" onClick={handleSubmit}>Save</Button>
                            )}    
                            {student && student.id > 0 && (
                                <Button variant="contained" onClick={handleUpdate}>Update</Button>
                            )}
                        </CardActions>
                        
                    </Stack>
                }
            </Stack> */}
            <StudentsFilters onSearch={handleSearch}/>
            {loading && <Typography>Loading ...</Typography>}
            {error && <Typography>{error}</Typography>}
            {/* Check if there are no students and display a message */}
            {filteredFeesSummaryList.length === 0 ? (
                <Typography>No fees found</Typography>
            ) : (
                <FeesSummaryTable
                    count={filteredFeesSummaryList.length}
                    page={page}
                    rows={paginatedStudents}
                    rowsPerPage={rowsPerPage}
                    onViewFeesDetails={handleViewFeesDetails}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            )}

            <React.Fragment>

                <Dialog
                    fullScreen
                    open={openFeesDetails}
                    onClose={handleCloseFeesDetails}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{ position: 'relative' }}>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleCloseFeesDetails}
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
                        <StepperWithGrid selectedStudent={studentDetails} />
                    </Card>
                </Dialog>
            </React.Fragment>

    {/* <React.Fragment>
      
      <Dialog
        open={showDelAlert}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Are you sure, to remove student "+selectedStudentForDel?.first_name+" "+selectedStudentForDel?.last_name+"?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Don't worry, This is a Soft Delete.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteNo}>No</Button>
          <Button onClick={handleDeleteYes}>Yes</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment> */}
    
        </Stack>
    );
}

function applyPagination(rows: FeesSummary[], page: number, rowsPerPage: number): FeesSummary[] {
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
