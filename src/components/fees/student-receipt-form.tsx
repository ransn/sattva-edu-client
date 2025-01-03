import React, { useState, useEffect } from 'react';
import { Stepper, Step, StepLabel, Button, TableContainer, Table, TableHead, TableCell, TableRow, TableBody, Paper, IconButton, Grid } from '@mui/material';
// import Card from '@mui/material/Card';

// import CardContent from '@mui/material/CardContent';
// import CardHeader from '@mui/material/CardHeader';
// import Divider from '@mui/material/Divider';
// import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { Student } from '@/components/dashboard/students/students-table';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
//import { maxHeight, spacing, Stack } from '@mui/system';
import dayjs from 'dayjs';
import axios from 'axios';


export interface FeeDetails {
    id: number,
    receipt_no: string,
    fee_type: string,
    fee: number,
    discount: number,
    paid: number,
    student_id: number,
    fee_status: string
    last_modified_by: string,
    [key: string]: string | number; // This allows dynamic keys
}


interface StepperWithGridProps {
    selectedStudent: Student | null | undefined; // selectedStudent can be null if no student is selected
}

export function StepperWithGrid({ selectedStudent }: StepperWithGridProps): React.JSX.Element {
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Array to store step titles
    const steps = ['Student Profile', 'Add Fees', 'Preview'];
    const [activeStep, setActiveStep] = useState(0);

    //const [receiptNum, setReceiptNum] = useState('');
    // const [paymentDate, setPaymentDate] = useState(() => {
    //     const today = new Date();
    //     return today.toISOString().split('T')[0]; // 'yyyy-MM-dd' format
    // });
    const [feesList, setFeesList] = useState<Array<FeeDetails>>([]);
    //const [studentFeeSummary] = useState(selectedStudentFeesSummary);
    //console.log(studentFeeSummary);
    //const [selectedStudent, setSelectedStudent] = useState(selectedStudentFromFeeTable);
    const [studentData, setStudentData] = useState();
    const [feeData, setFeeData] = useState<Array<FeeDetails>>([]);
    const [totalFeeData, setTotalFeeData] = useState({ totalFee: 0, totalDiscount: 0, totalAfterDiscount: 0, totalPaid: 0, totalBalance: 0 });
    // State to store the rows
    const [rows, setRows] = useState<Array<FeeDetails>>([]);
    const [showFeeDetails, setShowFeeDetails] = useState(false);
    console.log("Child page:", selectedStudent);

    useEffect(() => {
        // Calculate the totals and data for feeData
        const totalFee = rows.reduce((total, row) => total + row.fee, 0);
        const totalDiscount = rows.reduce((total, row) => total + row.discount, 0);

        // Calculate after discount and balance without toFixed to preserve numbers
        const totalAfterDiscount = rows.reduce(
            (total, row) => total + (row.fee - row.discount),
            0
        );

        const totalPaid = rows.reduce((total, row) => total + row.paid, 0);

        const totalBalance = rows.reduce(
            (total, row) => total + (row.fee - row.discount - row.paid),
            0
        );

        // Update the total fee data state with the totals
        setTotalFeeData({
            totalFee,
            totalDiscount,
            totalAfterDiscount,
            totalPaid,
            totalBalance
        });
    }, [rows]); // Only re-run effect when rows change

    // useEffect(() => {
    //     // load student details and set to selectedStudent
    //     // if (selectedStudentFeesSummary?.student_id) {
    //     //     fetchStudentDetails();
    //     //     console.log(selectedStudent);
    //     // }    
        
    // },[selectedStudent])

    

    const finalBillData = { selectedStudent, feeData, totalFeeData };

    // const handlePaymentChange = (date: Dayjs | null) => {
    //     // Convert PickerValidDate to Dayjs
    //     const dayjsDate = date ? (date) : null;
    //     //setDob(dayjsDate); // Set the Dayjs date in the state
    //     setPaymentDate(dayjsDate?dayjsDate.format('YYYY-MM-DD'):'');
    // };

    // const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setReceiptNum(e.target.value)
    // };

    // Function to handle the "Next" button click
    const handleNext = () => {
        if (activeStep === 0) {
            fetchStudentFeesList();
        }

        if (activeStep === 1) {
            const updatedFeeData: FeeDetails[] = [];
            const year = new Date().getFullYear();
            const nextYear = year + 1;
            rows.forEach((row) => {
                if (row.id === -1) {
                    row.receipt_no = 'SPA-' + year + '/' + nextYear + '-' + selectedStudent?.id;
                    row.student_id = selectedStudent?selectedStudent.id:-1;
                    updatedFeeData.push(row);
                }
            });

            console.log("Only updated fee details are: ", updatedFeeData);
            
            if(updatedFeeData.length > 0){
                saveFeeDetails(updatedFeeData);
            }

            setFeeData(rows);
        }
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const fetchStudentFeesList = async () => {
        try {
            const response = await fetch(`${apiUrl}/fees/${selectedStudent?.id}`); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error("Failed to fetch student details");
            }
            const data = await response.json();
            setRows(data);
        } catch (err) {
            console.log("Error fetching student data");
        }
    }

    const saveFeeDetails = async (updatedFeeData:FeeDetails[]) => {
        try{
            const response = await axios.post(`${apiUrl}/fees/`, updatedFeeData);
            console.log('Fees details added successfully:', response.data);
        }catch (error) {
            // Handle errors
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.response?.data || error.message);
            } else {
                console.error('Unexpected error:', error);
            }
        }
    }

    // Function to handle the "Back" button click
    const handleBack = () => {
        if(activeStep === 2){
            fetchStudentFeesList();
        }
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };
    // Handle adding a new row
    const handleAddRow = () => {
        const newRow:FeeDetails = {
            "id": -1,
            "fee_status":'A',
            "receipt_no": '',
            "fee_type": '',
            "fee": 0,
            "discount": 0,
            "paid": 0,
            "student_id": 0,
            "last_modified_by": 'test_user'
        };
        setRows([...rows, newRow]);  // Add the new row to the table
    };

    // Handle input change for each row
    const handleChange = (index: number, field: string, value: string | number) => {
        const updatedRows = [...rows];
        //updatedRows[index][field] = value;
        // Try to convert the value to a number if it's a string
        if (typeof value === 'string') {
            // Attempt to parse as a number
            const parsedValue = isNaN(Number(value)) ? value : Number(value);
            updatedRows[index][field] = parsedValue;
        } else {
            updatedRows[index][field] = value; // Directly assign the number if it's already a number
        }
        setRows(updatedRows);
    };

    // Handle deleting a row
    const handleDeleteRow = (index: number) => {
        const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index); // Filter out the row by index
        setRows(updatedRows); // Update the state with the filtered rows
    };

    const handleGenerateBill = () => {
        const fileName = finalBillData.selectedStudent?.first_name.concat('.pdf')
        console.log('Generating');
        fetch(`${apiUrl}/fees/generate-bill`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalBillData),
        })
        .then(response => response.blob())
        .then(blob => {
            // Create a link to download the PDF
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName? fileName : 'generated-file';
            link.click();
        })
        .catch(error => {
            console.log('Error generating PDF:', error);
        });
    }


    return (
        <div style={{ marginBottom: 40 }}>
            {/* Stepper component */}
            <Box margin={5}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <Box marginLeft={20} marginRight={20}>
                {activeStep === 0 &&
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Student Profile:</strong></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell><b>Student Id: </b>{selectedStudent?.id || 'NA'}</TableCell>
                                <TableCell><b>Name: </b>{selectedStudent?.first_name || 'NA'} {selectedStudent?.last_name || 'NA'}</TableCell>
                                <TableCell><b>Class: </b>{selectedStudent?.class_type || 'NA'}</TableCell>
                                <TableCell><b>DOB: </b>{selectedStudent && selectedStudent.date_of_birth ? dayjs(selectedStudent.date_of_birth).format('YYYY-MM-DD') : 'NA'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><b>Father Name: </b>{selectedStudent?.father_first_name || 'NA'} {selectedStudent?.father_last_name || 'NA'}</TableCell>
                                <TableCell><b>Mother Name: </b>{selectedStudent?.mother_first_name || 'NA'} {selectedStudent?.mother_last_name || 'NA'}</TableCell>
                                <TableCell><b>Phone: </b>{selectedStudent?.contact_number || 'NA'}</TableCell>
                                <TableCell><b>Admission Date: </b>{selectedStudent && selectedStudent.admission_date ? dayjs(selectedStudent.admission_date).format('YYYY-MM-DD') : 'NA'}</TableCell>
                                {/* <TableCell><b>Receipt No: </b><input type='text' style={{ height: '30px', fontSize: '14px' }} required value={receiptNum} onChange={handleReceiptChange} /></TableCell> */}
                            </TableRow>
                            <TableRow>
                                <TableCell><b>Address: </b>{selectedStudent?.address || 'NA'}</TableCell>
                                {/* <TableCell>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker label="Payment Date"
                                            onChange={handlePaymentChange} value={dayjs(paymentDate)} />
                                    </LocalizationProvider>
                                </TableCell> */}
                            </TableRow>
                        </TableBody>
                    </Table>}
                {activeStep === 1 &&
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong> Fee Details </strong></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" onClick={handleAddRow} size='small' >
                                            +
                                        </Button>
                                    </TableCell> {/* Add actions column for delete button */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <TextField
                                                value={row.fee_type}
                                                onChange={(e) => {handleChange(index, 'fee_type', e.target.value)}}
                                                label="Fees Type"
                                                variant="standard"
                                                disabled={row.id !== -1}
                                            />
                                        </TableCell>
                                        <TableCell><TextField
                                                value={row.receipt_no}
                                                label="Receipt No"
                                                variant="standard"
                                                disabled={true}
                                            /></TableCell>
                                        <TableCell>
                                            <TextField
                                                value={row.fee}
                                                type='number'
                                                onChange={(e) => {handleChange(index, 'fee', e.target.value)}}
                                                label="Fee"
                                                variant="standard"
                                                disabled={row.id !== -1}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={row.discount}
                                                type='number'
                                                onChange={(e) => {handleChange(index, 'discount', e.target.value)}}
                                                label="Discount"
                                                variant="standard"
                                                disabled={row.id !== -1}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={parseFloat((row.fee - row.discount).toFixed(2))}
                                                type='number'
                                                label="After Discount"
                                                variant="standard"
                                                disabled={true}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={row.paid}
                                                type='number'
                                                onChange={(e) => {handleChange(index, 'paid', e.target.value)}}
                                                label="Paid"
                                                variant="standard"
                                                disabled={row.id !== -1}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={parseFloat((row.fee - row.discount - row.paid).toFixed(2))}
                                                type='number'
                                                label="Balance"
                                                variant="standard"
                                                disabled={true}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => {handleDeleteRow(index)}} color="secondary" disabled={row.id !== -1}>
                                                <DeleteIcon size={25} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>

                                ))}
                                <TableRow>
                                    <TableCell><TextField
                                        value='Total'
                                        label="Total"
                                        variant="standard"
                                        disabled={true}
                                    /></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>
                                        <TextField
                                            value={totalFeeData.totalFee}
                                            type='number'
                                            label="Total Fee"
                                            variant="standard"
                                            disabled={true}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={totalFeeData.totalDiscount}
                                            type='number'
                                            label="Total Discount"
                                            variant="standard"
                                            disabled={true}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={totalFeeData.totalAfterDiscount}
                                            type='number'
                                            label="Final Fee"
                                            variant="standard"
                                            disabled={true}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={totalFeeData.totalPaid}
                                            type='number'
                                            label="Total Paid"
                                            variant="standard"
                                            disabled={true}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={totalFeeData.totalBalance}
                                            type='number'
                                            label="Total Balance"
                                            variant="standard"
                                            disabled={true}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>}
            </Box>

            {activeStep === 2 &&
                <Box marginLeft={20} marginRight={20}>
                    
                    <TableContainer>
                    <Table>
                            <TableHead />
                            <TableBody>
                                <TableRow>
                                    <TableCell>Student Id: <strong>{finalBillData.selectedStudent?.id || 'NA'}</strong></TableCell>
                                    <TableCell>Name: <strong>{finalBillData.selectedStudent?.first_name || 'NA'} {finalBillData.selectedStudent?.last_name || 'NA'}</strong></TableCell>
                                    <TableCell>Class: <strong>{finalBillData.selectedStudent?.class_type || 'NA'}</strong></TableCell>
                                    <TableCell>DOB: <strong>{finalBillData.selectedStudent && finalBillData.selectedStudent.date_of_birth ? dayjs(finalBillData.selectedStudent.date_of_birth).format('YYYY-MM-DD') : 'NA'}</strong></TableCell>

                                </TableRow>
                                <TableRow>
                                    <TableCell>Father Name: <strong>{finalBillData.selectedStudent?.father_first_name || 'NA'} {finalBillData.selectedStudent?.father_last_name || 'NA'}</strong></TableCell>
                                    <TableCell>Mother Name: <strong>{finalBillData.selectedStudent?.mother_first_name || 'NA'} {finalBillData.selectedStudent?.mother_last_name || 'NA'}</strong></TableCell>
                                    <TableCell>Phone: <strong>{finalBillData.selectedStudent?.contact_number || 'NA'}</strong></TableCell>
                                    <TableCell>Admission Date: <strong>{finalBillData.selectedStudent && finalBillData.selectedStudent.admission_date? dayjs(finalBillData.selectedStudent.admission_date).format('YYYY-MM-DD') : 'NA'}</strong></TableCell>
                                    {/* <TableCell>Receipt No: <strong>{finalBillData.selectedStudent?.receipt_no || 'NA'}</strong></TableCell> */}
                                </TableRow>
                                <TableRow>
                                    <TableCell>Address: <strong>{finalBillData.selectedStudent?.address || 'NA'}</strong></TableCell>
                                    {/* <TableCell>Payment Date: <strong>{finalBillData.selectedStudent?.payment_date || 'NA'}</strong></TableCell> */}
                                </TableRow>
                            </TableBody>
                        </Table>
                        </TableContainer>
                        {/* <Grid container justifyContent='flex-end'>
                            <Button variant="outlined" color="primary" onClick={handlePreview}> Show Fee Details </Button>
                        </Grid> */}
                        {/* {showFeeDetails &&  */}
                        <TableContainer component={Paper}>
                        <Table>
                            <TableHead >
                            <TableRow>
                                <TableCell>Fee Type</TableCell>
                                <TableCell>Receipt #</TableCell>
                                <TableCell>Fee</TableCell>
                                <TableCell>Discount</TableCell>
                                <TableCell>Final Fee</TableCell>
                                <TableCell>Paid</TableCell>
                                <TableCell>Balance</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                {finalBillData.feeData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <strong>{row.fee_type}</strong>
                                        </TableCell>
                                        <TableCell>
                                            {row.receipt_no}
                                        </TableCell>
                                        <TableCell>
                                            {row.fee}
                                        </TableCell>
                                        <TableCell>
                                        {row.discount}
                                        </TableCell>
                                        <TableCell>
                                        {row.fee - row.discount}
                                        </TableCell>
                                        <TableCell>
                                        {row.paid}
                                        </TableCell>
                                        <TableCell>
                                        {row.fee - row.discount - row.paid}
                                        </TableCell>
                                    </TableRow>

                                ))}
                                <TableRow>
                                    <TableCell><strong>Total: </strong></TableCell>
                                    <TableCell />
                                    <TableCell>
                                    <strong>{finalBillData.totalFeeData.totalFee}</strong>
                                    </TableCell>
                                    <TableCell>
                                    <strong>{finalBillData.totalFeeData.totalDiscount}</strong>
                                    </TableCell>
                                    <TableCell>
                                    <strong>{finalBillData.totalFeeData.totalAfterDiscount}</strong>
                                    </TableCell>
                                    <TableCell>
                                    <strong>{finalBillData.totalFeeData.totalPaid}</strong>
                                    </TableCell>
                                    <TableCell>
                                    <strong>{finalBillData.totalFeeData.totalBalance}</strong>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </Box>
                    
            }

            {activeStep === 3 &&
                <Box marginLeft={110}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBack}
                    > Generate </Button></Box>
            }
            <Box marginLeft={22} marginRight={22} marginTop={2}>
            <Grid container direction='row' justifyContent={'space-between'}>
                <Grid>
                <Button variant="outlined" color="primary" onClick={handleBack} disabled={activeStep === 0} size='small'>Back</Button>
                    
            
                </Grid>
                <Grid>
                    {activeStep !== steps.length - 1 && 
                    <Button variant="contained" color="primary" onClick={handleNext} size='small'>Next</Button>}
                    {activeStep === steps.length - 1 && 
                        <Button variant="contained" color="primary" onClick={handleGenerateBill} size='small'>Download</Button>    
                    }
                    </Grid>
            </Grid>
            </Box>
        </div>
    );
}

// function StepperWithGrid() {
//   const [activeStep, setActiveStep] = useState(0);

//   // Array to store step titles
//   const steps = ['Step 1', 'Step 2', 'Step 3'];

//   // Function to handle the "Next" button click
//   const handleNext = () => {
//     if (activeStep < steps.length - 1) {
//       setActiveStep(activeStep + 1);
//     }
//   };

//   // Function to handle the "Back" button click
//   const handleBack = () => {
//     if (activeStep > 0) {
//       setActiveStep(activeStep - 1);
//     }
//   };

//   return (
//     <div>
//       {/* Stepper component */}
//       <Stepper activeStep={activeStep} alternativeLabel>
//         {steps.map((label, index) => (
//           <Step key={index}>
//             <StepLabel>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {/* Grid for content inside each step */}
//       <Grid container spacing={3} style={{ padding: 20 }}>
//         <Grid item xs={12}>
//           <Typography variant="h6" gutterBottom>
//             {activeStep === 0 && 'Content for Step 1'}
//             {activeStep === 1 && 'Content for Step 2'}
//             {activeStep === 2 && 'Content for Step 3'}
//           </Typography>
//         </Grid>
//       </Grid>

//       {/* Navigation buttons */}
//       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleBack}
//           disabled={activeStep === 0}
//         >
//           Back
//         </Button>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleNext}
//           disabled={activeStep === steps.length - 1}
//         >
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// }
