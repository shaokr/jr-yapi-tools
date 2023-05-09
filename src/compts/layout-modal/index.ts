import { Modal } from 'antd';
import { ModalStaticFunctions } from 'antd/lib/modal/confirm';
export let layoutModal: Omit<ModalStaticFunctions, 'warn'> = Modal;

export const useModalCustom = () => {
  const [_modal, contextHolder] = Modal.useModal();
  layoutModal = _modal;
  return contextHolder;
};
