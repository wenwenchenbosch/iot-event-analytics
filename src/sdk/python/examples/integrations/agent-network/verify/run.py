##############################################################################
# Copyright (c) 2021 Bosch.IO GmbH
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# SPDX-License-Identifier: MPL-2.0
##############################################################################

import asyncio
import logging
import os

from jwcrypto import jwk

os.environ['MQTT_TOPIC_NS'] = 'iotea/'

# pylint: disable=wrong-import-position
from iotea.core.talent_func import FunctionTalent
from iotea.core.util.logger import Logger
logging.setLoggerClass(Logger)
logging.getLogger().setLevel(logging.INFO)

from verifier import Verifier

class VerifyTalent(FunctionTalent):
    def __init__(self, connection_string):
        super(VerifyTalent, self).__init__('VerifyTalent', connection_string)
        self.register_function('verify', self.__verify)
        self.register_function('sign', self.__sign)
        self.register_function('signerdid', self.__signerdid)
        self.verifier = Verifier()

        jwk_raw = os.getenv('JWK')

        if jwk_raw and jwk_raw != '':
            try:
                self.key = jwk.JWK.from_json(jwk_raw)
                self.logger.info('Successfully stored Key from JWK: {}'.format(self.key))
            # pylint: disable=broad-except
            except Exception as ex:
                self.logger.error('Could not import JWK: {}'.format(ex))

    # pylint: disable=unused-argument
    def __verify(self, payload, ev, evtctx):
        self.logger.info('Received verification request for value {}'.format(payload))
        result = self.verifier.verify(payload)

        # If error message
        if isinstance(result, str):
            self.logger.error('Verify failed: {}'.format(result))
            return result
        else:
            return self.verifier.verify(payload).decode('utf-8')

    # pylint: disable=unused-argument
    async def __sign(self, payload, ev, evtctx):
        if self.key is None or self.key == '':
            return 'no key given'

        return await self.verifier.sign(payload, self.key)

    # pylint: disable=unused-argument
    async def __signerdid(self, payload, ev, evtctx):
        return await self.verifier.signer_did(payload)

async def main():
    verify_talent = VerifyTalent('mqtt://localhost:1883')
    await verify_talent.start()

LOOP = asyncio.get_event_loop()
LOOP.run_until_complete(main())
LOOP.close()
