'use client';

import * as React from 'react';
//import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip'
//import dayjs from 'dayjs';
import Button from '@mui/material/Button';
// import { Receipt as ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';
// import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
// import { NotePencil as EditIcon } from '@phosphor-icons/react/dist/ssr/NotePencil';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';


import { useSelection } from '@/hooks/use-selection';

export interface FeesSummary {
  student_name: string,
  receipt_no: string,
  total_fee: number,
  total_paid: number,
  total_discount: number,
  student_id: number
}

type OnPageChangeHandler = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
type OnRowsPerPageChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
type OnViewFeesDetailsHandler = (feesSummary: FeesSummary) => void;

interface FeesSummaryTableProps {
  count?: number;
  page?: number;
  rows?: FeesSummary[];
  rowsPerPage?: number;
  onViewFeesDetails?:OnViewFeesDetailsHandler
  onPageChange?:OnPageChangeHandler
  onRowsPerPageChange?:OnRowsPerPageChangeHandler
}

export function FeesSummaryTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onViewFeesDetails,
  onPageChange,
  onRowsPerPageChange,
}: FeesSummaryTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((feesSummary) => feesSummary.student_id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const callRowsPerPageChangeMethodInParent = (event: React.ChangeEvent<HTMLInputElement>) =>{
    if(onRowsPerPageChange){
      onRowsPerPageChange(event);
    }
  }

  const callPageChangeMethodInParent = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) =>{
    if(onPageChange){
      onPageChange(event, page);
    }
  }

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }} size='small'>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox size='small'
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell size='medium'>Name</TableCell>
              {/* <TableCell>Receipt No</TableCell> */}
              <TableCell>Total Fee</TableCell>
              <TableCell>Total Paid</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.student_id);

              return (
                <TableRow hover key={row.student_id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox size='small'
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.student_id);
                        } else {
                          deselectOne(row.student_id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      {/* <Avatar src={row.avatar} /> */}
                      <Typography variant="subtitle2">{row.student_name}</Typography>
                    </Stack>
                  </TableCell>
                  {/* <TableCell>{row.receipt_no}</TableCell> */}
                  {/* <TableCell>
                    {row.address.city}, {row.address.state}, {row.address.country}
                  </TableCell> */}
                  <TableCell>{row.total_fee - row.total_discount}</TableCell>
                  <TableCell>{row.total_paid}</TableCell>
                  <TableCell>{row.total_fee - row.total_discount - row.total_paid}</TableCell>
                  <TableCell>
                    <Stack sx={{alignItems: 'flex-start'}} direction="row" spacing={1}>
                    {/* <Tooltip title="Edit" arrow>
                    <Button color="primary"
                      startIcon={<EditIcon fontSize="var(--icon-fontSize-sm)" />} onClick={() => onStudentSelect(row)}/>
                    </Tooltip> */}
                    <Tooltip title="Fee Break Up" arrow>
                    <Button color="primary" 
                      startIcon={<EyeIcon fontSize="var(--icon-fontSize-sm)" />} onClick={() => {if(onViewFeesDetails)onViewFeesDetails(row)}}/>
                    </Tooltip>  
                    {/* <Tooltip title="Remove" arrow>
                    <Button color="primary" 
                      startIcon={<TrashIcon fontSize="var(--icon-fontSize-sm)" />} onClick={() => onStudentDelSelect(row)} />
                    </Tooltip>   */}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={callPageChangeMethodInParent}
        onRowsPerPageChange={callRowsPerPageChangeMethodInParent}
      />
    </Card>
  );
}
