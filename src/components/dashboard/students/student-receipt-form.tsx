import React, { useState, useEffect } from 'react';
import { Stepper, Step, StepLabel, Button, Typography, TableContainer, Table, TableHead, TableCell, TableRow, TableBody, Paper, IconButton, Grid } from '@mui/material';
import Card from '@mui/material/Card';

import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickerValidDate } from '@mui/x-date-pickers/internals/hooks/useValidation';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import type { Student } from '@/components/dashboard/students/students-table';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { maxHeight, spacing, Stack } from '@mui/system';
import dayjs, { Dayjs } from 'dayjs';


interface StepperWithGridProps {
    selectedStudent: Student | null | undefined; // selectedStudent can be null if no student is selected
}

export function StepperWithGrid({ selectedStudent }: StepperWithGridProps): React.JSX.Element {

    // Array to store step titles
    const steps = ['Student Profile', 'Add Fees', 'Preview'];
    const [activeStep, setActiveStep] = useState(0);

    const [receiptNum, setReceiptNum] = useState('');
    const [paymentDate, setPaymentDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // 'yyyy-MM-dd' format
    });

    const [studentData, setStudentData] = useState(selectedStudent);
    const [feeData, setFeeData] = useState([]);
    const [totalFeeData, setTotalFeeData] = useState({ totalFee: 0, totalDiscount: 0, totalAfterDiscount: 0, totalPaid: 0, totalBalance: 0 });
    // State to store the rows
    const [rows, setRows] = useState<Array<{ fees_type: string; fee: number; discount: number; after_discount: number; paid: number; balance: number }>>([]);
    const [showFeeDetails, setShowFeeDetails] = useState(false);
    useEffect(() => {
        // Calculate the totals and data for feeData
        const totalFee = rows.reduce((total, row) => total + parseFloat(row.fee), 0);
        const totalDiscount = rows.reduce((total, row) => total + parseFloat(row.discount), 0);

        // Calculate after discount and balance without toFixed to preserve numbers
        const totalAfterDiscount = rows.reduce(
            (total, row) => total + (parseFloat(row.fee) - parseFloat(row.discount)),
            0
        );

        const totalPaid = rows.reduce((total, row) => total + parseFloat(row.paid), 0);

        const totalBalance = rows.reduce(
            (total, row) => total + (parseFloat(row.fee) - parseFloat(row.discount) - parseFloat(row.paid)),
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

    const finalBillData = { studentData, feeData, totalFeeData };

    const handlePaymentChange = (date: PickerValidDate | null) => {
        // Convert PickerValidDate to Dayjs
        const dayjsDate = date ? (date) : null;
        //setDob(dayjsDate); // Set the Dayjs date in the state
        setPaymentDate(dayjsDate.format('YYYY-MM-DD'));
    };

    const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReceiptNum(e.target.value)
    };

    // Function to handle the "Next" button click
    const handleNext = () => {
        if (activeStep === 0) {
            studentData['receipt_no'] = receiptNum;
            studentData['payment_date'] = paymentDate;
        }

        if (activeStep === 1) {
        const updatedFeeData = [];

        rows.forEach((row) => {
            updatedFeeData.push({
                fees_type: row.fees_type,
                fee: parseFloat(row.fee),
                discount: parseFloat(row.discount),
                after_discount: parseFloat(row.fee) - parseFloat(row.discount),
                paid: parseFloat(row.paid),
                balance: parseFloat(row.fee) - parseFloat(row.discount) - parseFloat(row.paid),
            });
        });

        setFeeData(updatedFeeData);
        console.log(feeData);
        console.log("printing final data")
        console.log(finalBillData)

        }
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    // Function to handle the "Back" button click
    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };
    // Handle adding a new row
    const handleAddRow = () => {
        const newRow = {
            fees_type: '',
            fee: 0,
            discount: 0,
            after_discount: 0,
            paid: 0,
            balance: 0
        };
        setRows([...rows, newRow]);  // Add the new row to the table
    };

    // Handle input change for each row
    const handleChange = (index: number, field: string, value: string | number) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    // Handle deleting a row
    const handleDeleteRow = (index: number) => {
        const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index); // Filter out the row by index
        setRows(updatedRows); // Update the state with the filtered rows
    };

    const handlePreview = () =>{
        console.log('reloading');
        console.log(finalBillData);
        setShowFeeDetails(true);
    }

    // const generateBill = async () => {
    //         setLoading(true);
    //         try {
    //             const response = await fetch("http://localhost:5000/students/"); // Replace with your API endpoint
    //             if (!response.ok) {
    //                 throw new Error("Failed to fetch students data");
    //             }
    //             const data: Student[] = await response.json();
    //             setStudents(data);
    //             setError(null)
    //         } catch (err) {
    //             setError("Error fetching student data");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    const handleGenerateBill = () => {
        console.log('Generating');
        fetch('http://localhost:5000/students/generate-bill', {
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
            link.download = 'generated-file.pdf';
            link.click();
        })
        .catch(error => {
            console.error('Error generating PDF:', error);
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

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell><b>Name: </b>{selectedStudent?.first_name || 'NA'} {selectedStudent?.last_name || 'NA'}</TableCell>
                                <TableCell><b>Class: </b>{selectedStudent?.class_type || 'NA'}</TableCell>
                                <TableCell><b>DOB: </b>{selectedStudent?.date_of_birth || 'NA'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><b>Father's Name: </b>{selectedStudent?.father_first_name || 'NA'} {selectedStudent?.father_last_name || 'NA'}</TableCell>
                                <TableCell><b>Student Id: </b>{selectedStudent?.id || 'NA'}</TableCell>
                                <TableCell><b>Receipt No: </b><input type='text' style={{ height: '30px', fontSize: '14px' }} required value={receiptNum} onChange={handleReceiptChange} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><b>Mother's Name: </b>{selectedStudent?.mother_first_name || 'NA'} {selectedStudent?.mother_last_name || 'NA'}</TableCell>
                                <TableCell><b>Phone: </b>{selectedStudent?.contact_number || 'NA'}</TableCell>
                                <TableCell><b>Admission Date: </b>{selectedStudent?.admission_date || 'NA'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><b>Address: </b>{selectedStudent?.address || 'NA'}</TableCell>
                                <TableCell>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker label="Payment Date"
                                            onChange={handlePaymentChange} value={dayjs(paymentDate)} />
                                    </LocalizationProvider>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>}
                {activeStep === 1 &&
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Fee Details:</strong></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" onClick={handleAddRow}>
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
                                                value={row.fees_type}
                                                onChange={(e) => handleChange(index, 'fees_type', e.target.value)}
                                                label="Fees Type"
                                                variant="standard"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={row.fee}
                                                type='number'
                                                onChange={(e) => handleChange(index, 'fee', e.target.value)}
                                                label="Fee"
                                                variant="standard"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={row.discount}
                                                type='number'
                                                onChange={(e) => handleChange(index, 'discount', e.target.value)}
                                                label="Discount"
                                                variant="standard"
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
                                                onChange={(e) => handleChange(index, 'paid', e.target.value)}
                                                label="Paid"
                                                variant="standard"
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
                                            <IconButton onClick={() => handleDeleteRow(index)} color="secondary">
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
                                    <TableCell>Name: <strong>{finalBillData.studentData?.first_name || 'NA'} {finalBillData.studentData?.last_name || 'NA'}</strong></TableCell>
                                    <TableCell>Class: <strong>{finalBillData.studentData?.class_type || 'NA'}</strong></TableCell>
                                    <TableCell>DOB: <strong>{finalBillData.studentData?.date_of_birth || 'NA'}</strong></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Father's Name: <strong>{finalBillData.studentData?.father_first_name || 'NA'} {finalBillData.studentData?.father_last_name || 'NA'}</strong></TableCell>
                                    <TableCell>Student Id: <strong>{finalBillData.studentData?.id || 'NA'}</strong></TableCell>
                                    <TableCell>Receipt No: <strong>{finalBillData.studentData?.receipt_no || 'NA'}</strong></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Mother's Name: <strong>{finalBillData.studentData?.mother_first_name || 'NA'} {finalBillData.studentData?.mother_last_name || 'NA'}</strong></TableCell>
                                    <TableCell>Phone: <strong>{finalBillData.studentData?.contact_number || 'NA'}</strong></TableCell>
                                    <TableCell>Admission Date: <strong>{finalBillData.studentData?.admission_date || 'NA'}</strong></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Address: <strong>{finalBillData.studentData?.address || 'NA'}</strong></TableCell>
                                    <TableCell>Payment Date: <strong>{finalBillData.studentData?.payment_date || 'NA'}</strong></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        </TableContainer>
                        <Grid container justifyContent='flex-end'>
                            <Button variant="outlined" color="primary" onClick={handlePreview}> Show Fee Details </Button>
                        </Grid>
                        {showFeeDetails && 
                        <TableContainer component={Paper}>
                        <Table>
                            <TableHead />
                            <TableBody>
                                {finalBillData.feeData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            Fee Type: <strong>{row.fees_type}</strong>
                                        </TableCell>
                                        <TableCell>
                                            Fee: <strong>{row.fee}</strong>
                                        </TableCell>
                                        <TableCell>
                                        Discount: <strong>{row.discount}</strong>
                                        </TableCell>
                                        <TableCell>
                                        Final Fee: <strong>{row.after_discount}</strong>
                                        </TableCell>
                                        <TableCell>
                                        Paid: <strong>{row.paid}</strong>
                                        </TableCell>
                                        <TableCell>
                                        Balance: <strong>{row.balance}</strong>
                                        </TableCell>
                                    </TableRow>

                                ))}
                                <TableRow>
                                    <TableCell><strong>Total: </strong></TableCell>
                                    <TableCell>
                                    Total Fee: <strong>{finalBillData.totalFeeData.totalFee}</strong>
                                    </TableCell>
                                    <TableCell>
                                    Total Discount: <strong>{finalBillData.totalFeeData.totalDiscount}</strong>
                                    </TableCell>
                                    <TableCell>
                                    Final Total Fee: <strong>{finalBillData.totalFeeData.totalAfterDiscount}</strong>
                                    </TableCell>
                                    <TableCell>
                                    Total Paid: <strong>{finalBillData.totalFeeData.totalPaid}</strong>
                                    </TableCell>
                                    <TableCell>
                                    Total Balance: <strong>{finalBillData.totalFeeData.totalBalance}</strong>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>}
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
            <Box marginTop={5} marginLeft={100} justifyContent={'space-between'}>
                <Stack direction='row' spacing={16}>
                    <Button variant="contained" color="primary" onClick={handleBack} disabled={activeStep === 0}>Back</Button>
                    {activeStep === steps.length - 1 && 
                        <Button variant="contained" color="primary" onClick={handleGenerateBill}>Generate</Button>    
                    }
                    {activeStep != steps.length - 1 && 
                    <Button variant="contained" color="primary" onClick={handleNext}>Next</Button>}
                </Stack>
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

export default StepperWithGrid;
