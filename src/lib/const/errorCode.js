export const MsgErrorCode = {
  MSG_RECORD_NOT_FOUND: -10001,
  MSG_PARTNER_SIGNATURE_MSG_NOT_FOUND: -10002,
  MSG_CONFIG_NOT_FOUND: -10003,
  MSG_SIGNATURES_REACH_REQUIRED: -10004,
}

export const MsgErrorMsg = {
  [MsgErrorCode.MSG_RECORD_NOT_FOUND]: 'Record not found.',
  [MsgErrorCode.MSG_PARTNER_SIGNATURE_MSG_NOT_FOUND]: `Partner message not found, maybe have not sent or no chatId in config.`,
  [MsgErrorCode.MSG_CONFIG_NOT_FOUND]: 'Config not found.',
  [MsgErrorCode.MSG_SIGNATURES_REACH_REQUIRED]: 'Partner signatures reach required',
}