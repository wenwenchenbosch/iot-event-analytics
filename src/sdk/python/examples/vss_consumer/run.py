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
import json
import os
import logging

from iotea.core.util.logger import Logger
from iotea.core.util.talent_io import TalentInput
logging.setLoggerClass(Logger)
logging.getLogger().setLevel(logging.INFO)

os.environ['MQTT_TOPIC_NS'] = 'iotea/'

# pylint: disable=wrong-import-position
from iotea.core.talent import Talent
from iotea.core.rules import OrRules, AndRules, Rule, ChangeConstraint, Constraint

class MyTalent(Talent):
    def __init__(self, connection_string):
        super(MyTalent, self).__init__('python-basic-talent', connection_string)
        self.prev = None
        self.prevVal = None

    def get_rules(self):
        return OrRules([
            Rule(ChangeConstraint('Speed', 'Vehicle', Constraint.VALUE_TYPE['RAW'])),
            Rule(ChangeConstraint('Acceleration$Lateral', 'Vehicle', Constraint.VALUE_TYPE['RAW']))
        ])

    async def on_event(self, ev, evtctx):
        #print(ev)
        #print(f'Raw value {TalentInput.get_raw_value(ev)}')
        if self.prev != None:
            deltaVal = self.prevVal - TalentInput.get_raw_value(ev)
            deltaT = self.prev - ev["whenMs"]
            delta = deltaVal/deltaT
            print(delta*1000, TalentInput.get_raw_value(ev), deltaT/-1000)
        self.prev = ev["whenMs"]
        self.prevVal = TalentInput.get_raw_value(ev)

async def main():
    my_talent = MyTalent('mqtt://localhost:1883')
    await my_talent.start()

LOOP = asyncio.get_event_loop()
LOOP.run_until_complete(main())
LOOP.close()
