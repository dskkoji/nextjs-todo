import React, { useState, useEffect } from 'react'
import { isBefore, formatISO } from 'date-fns'
import { Table as AntTable, Switch, Button } from 'antd'
import { ColumnsType } from 'antd/lib/table/interface'
import {
  CloseOutlined,
  CheckOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { doc, query, collection, getDocs, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore'
import Edit from '@/components/molecules/Edit'

import { db } from '@/lib/firebase'
import { Todo } from '@/types/todo'

const columns: ColumnsType<Todo> = [
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (_, { id, isComplete }) => {
      const el = (
        <Switch 
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          defaultChecked
          checked={isComplete}
          onChange={(checked) => 
            updateDoc(doc(db, 'todos', id), {
              isComplete: checked
            })
          }
        />
      )
      return el
    }
  },
  {
    title: 'Task',
    dataIndex: 'todo',
    key: 'todo',
    render: (_, { todo, isComplete }) => {
      const el = (
        <div style={{ textDecoration: isComplete ? 'line-through' : 'none' }}>
          {todo}
        </div>
      )
      return el
    }
  },
  {
    title: 'Created',
    dataIndex: 'date',
    key: 'date',
    render: (_, { date }) => formatISO(date),
  },
  {
    title: 'edit',
    dataIndex: 'edit',
    key: 'edit',
    render: (_, todo) => {
      const el = <Edit todoItem={todo} />
      return el
    }
  },
  {
    title: 'delete',
    dataIndex: 'delete',
    key: 'delete',
    render: (_, { id }) => {
      const el = (
        <Button 
          type="dashed"
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => deleteDoc(doc(db, 'todos', id))}
        />
      )
      return el
    }
  },
]

const Table: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    const q = query(collection(db, 'todos'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          todo: doc.data().todo,
          isComplete: doc.data().isComplete,
          date: doc.data().date.toDate()
      }))
      setTodos(data)
    })
  },[])
  
  const sortedTodos = todos.sort((a, b) => (isBefore(a.date, b.date) ? 1 : -1))

  return <AntTable rowKey="id" dataSource={sortedTodos} columns={columns} />
}

export default Table