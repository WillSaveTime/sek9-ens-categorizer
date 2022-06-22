import React, { useState, useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import {
  Radio,
  Button,
  Row,
  Col,
  Tooltip,
  Tag,
  Avatar,
  Card,
  Image,
  Spin,
  Pagination
} from 'antd'
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  HeartFilled
} from '@ant-design/icons'
import NumberFormat from 'react-number-format'
import FirebaseService from 'services/FirebaseService'
import { apiGetEthereums } from 'api/rest/ethereum'

import Flex from 'components/shared-components/Flex'
import AvatarStatus from 'components/shared-components/AvatarStatus'

const VIEW_LIST = 'LIST'
const VIEW_GRID = 'GRID'

const ItemHeader = ({ name }) => (
  <Tooltip title={name} key={`avatar-${name}`}>
    <div className="d-flex">
      <AvatarStatus
        size={18}
        type="circle"
        src={'/img/icons/ens-144x144.png'}
        name={name}
      />
    </div>
  </Tooltip>
)

const ItemInfo = ({ price, statusColor }) => (
  <Flex alignItems="center">
    <Tag
      className={statusColor === 'none' ? 'bg-gray-lightest' : ''}
      color={statusColor !== 'none' ? statusColor : ''}
      style={{ margin: '0px', fontSize: '14px' }}
    >
      <Image
        height={13}
        src={'/img/icons/ethereum-icon-28.png'}
        name={'price'}
      />
      <NumberFormat
        displayType={'text'}
        value={(Math.round(price * 1000) / 1000).toFixed(3)}
        prefix={''}
        thousandSeparator={true}
        className="ml-2 font-weight-semibold"
      />
    </Tag>
  </Flex>
)

const ItemMember = ({ data }) => (
  <>
    <Tooltip title={'Buy on OpenSea'} key={`avatar-opensea`}>
      <Avatar
        size={20}
        className={`ml-1 cursor-pointer`}
        src={'/img/icons/opensea-disabled.png'}
        style={{ backgroundColor: 'gray' }}
      />
    </Tooltip>
    <Tooltip title={'Add to Watchlist'} key={`avatar-watchlist`}>
      <Avatar
        size={20}
        className={`ml-1 cursor-pointer`}
        src={<HeartFilled style={{ color: '#808080' }} />}
      />
    </Tooltip>
  </>
)

const ListItem = ({ data }) => (
  <a href={`/name/${data.name}.eth/details`} target="_blank">
    <div
      className="bg-white rounded p-3 mb-3 border"
      style={{ backgroundColor: data.labelHash ? 'white' : '#8080803b' }}
    >
      <Row align="middle">
        <Col xs={24} sm={24} md={8}>
          <ItemHeader
            name={`${data.name}.eth`}
            category={`${data.starting_price}`}
          />
        </Col>
        <Col xs={24} sm={24} md={6}>
          <ItemInfo price={`${data.starting_price}`} statusColor={'orange'} />
        </Col>
        <Col xs={24} sm={24} md={5} />
        <Col xs={24} sm={24} md={3} />
        <Col xs={24} sm={24} md={2}>
          <div className="text-right">
            <ItemMember eth={data} />
          </div>
        </Col>
      </Row>
    </div>
  </a>
)

const GridItem = ({ data }) => (
  <a href={`/name/${data.name}.eth/details`} target="_blank">
    <Card style={{ backgroundColor: data.labelHash ? 'white' : '#8080803b' }}>
      <Flex alignItems="center" justifyContent="between">
        <ItemHeader name={`${data.name}.eth`} />
        <ItemInfo price={`${data.starting_price}`} statusColor={'orange'} />
      </Flex>
      <div className="mt-2 text-right">
        <ItemMember eth={data} />
      </div>
    </Card>
  </a>
)

const EthFeild = props => {
  const [view, setView] = useState(VIEW_GRID)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)

  useEffect(() => {
    if (props.category) {
      setLoading(true)
      // FirebaseService.getEthereums(props.category, 0, '', setEthereums)
      getEthereums()
    }
  }, [props])

  const getEthereums = async () => {
    console.log('==== props: ', props)
    const res = await apiGetEthereums({
      per_page: 1000,
      category_id: props.category.id
    })
    if (res && !res.error) {
      setEthereums(res.dataset)
    }
  }

  const setEthereums = data => {
    setLoading(false)
    setList(data)
  }
  const onChangeProjectView = e => {
    setView(e.target.value)
  }

  const handleChangePage = value => {
    setCurrentPage(value)
  }
  const handleSizeChange = (current, _pageSize) => {
    setCurrentPage(current)
    setPageSize(_pageSize)
  }

  const deleteItem = id => {
    const data = list.filter(elm => elm.id !== id)
    setList(data)
  }

  const currentDomains = list.filter(
    (_, index) =>
      index >= (currentPage - 1) * pageSize && index < currentPage * pageSize
  )
  return (
    <>
      <PageHeaderAlt className="border-bottom">
        <div className="container-fluid">
          <Flex justifyContent="between" alignItems="center" className="py-2">
            <h2>Domains</h2>
            <div>
              <Radio.Group
                defaultValue={VIEW_GRID}
                onChange={e => onChangeProjectView(e)}
              >
                <Radio.Button value={VIEW_GRID}>
                  <AppstoreOutlined />
                </Radio.Button>
                <Radio.Button value={VIEW_LIST}>
                  <UnorderedListOutlined />
                </Radio.Button>
              </Radio.Group>
              <Button type="primary" className="ml-2">
                <PlusOutlined />
                <span>New</span>
              </Button>
            </div>
          </Flex>
        </div>
      </PageHeaderAlt>
      <div
        className={`my-4 ${
          view === VIEW_LIST ? 'container' : 'container-fluid'
        }`}
      >
        {loading ? (
          <Spin />
        ) : view === VIEW_LIST ? (
          currentDomains &&
          currentDomains.length > 0 &&
          currentDomains.map(elm => <ListItem data={elm} key={elm.id} />)
        ) : (
          <Row gutter={16}>
            {currentDomains &&
              currentDomains.length > 0 &&
              currentDomains.map(elm => (
                <Col xs={24} sm={24} lg={8} xl={8} xxl={6} key={elm.id}>
                  <GridItem data={elm} removeId={id => deleteItem(id)} />
                </Col>
              ))}
          </Row>
        )}
        <Pagination
          defaultCurrent={1}
          total={list.length}
          current={currentPage}
          pageSize={pageSize}
          showSizeChanger
          defaultPageSize={24}
          pageSizeOptions={[15, 18, 24]}
          onShowSizeChange={handleSizeChange}
          onChange={handleChangePage}
        />
      </div>
    </>
  )
}

export default EthFeild
