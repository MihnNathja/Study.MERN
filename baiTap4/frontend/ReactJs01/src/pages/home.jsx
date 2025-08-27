import {CrownOutlined} from '@ant-design/icons';
import {Result} from "antd";

const HomePage = () => {
    return (
        <div>
            <Result
                icon={<CrownOutlined/>}
                title="JSON web token"
            />
        </div>
    )
}

export default HomePage;