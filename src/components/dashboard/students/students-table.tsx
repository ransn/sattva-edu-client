'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
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
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import { Receipt as ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';

import { useSelection } from '@/hooks/use-selection';


function noop(): void {
  // do nothing
}

export interface Student {

  id: 0,
  first_name: string,
  last_name: string,
  father_first_name: string,
  father_last_name: string,
  mother_first_name: string,
  mother_last_name: string,
  address: string,
  class_type: string,
  contact_number: string,
  date_of_birth: string,
  admission_date: string
}

type OnStudentSelectHandler = (student: Student) => void;

interface StudentsTableProps {
  count?: number;
  page?: number;
  rows?: Student[];
  rowsPerPage?: number;
  onStudentSelect?:OnStudentSelectHandler
}

export function StudentsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onStudentSelect,
}: StudentsTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((student) => student.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
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
              <TableCell>Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Admission Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.id);

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id);
                        } else {
                          deselectOne(row.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      {/* <Avatar src={row.avatar} /> */}
                      <Typography variant="subtitle2">{row.first_name+' '+row.last_name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.class_type}</TableCell>
                  {/* <TableCell>
                    {row.address.city}, {row.address.state}, {row.address.country}
                  </TableCell> */}
                  <TableCell>{row.contact_number}</TableCell>
                  <TableCell>{dayjs(row.admission_date).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <Stack sx={{alignItems: 'flex-start'}} direction="row" spacing={1}>
                    <Button color="primary" 
                      startIcon={<ReceiptIcon fontSize="var(--icon-fontSize-md)" />} onClick={() => onStudentSelect(row)}>
                      Receipt
                    </Button>
                     
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
        onPageChange={noop}
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
